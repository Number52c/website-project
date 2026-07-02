import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, CircleCheck as CheckCircle2, Circle, Clock, CircleAlert as AlertCircle } from "lucide-react";
import { useState as useStateHook } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  details: string[];
  completed: boolean;
  completedAt?: number;
}

export default function AgentOnboarding() {
  const { data: progress, isLoading } = trpc.agent.onboarding.getProgress.useQuery();
  const updateStepMutation = trpc.agent.onboarding.updateStep.useMutation();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(["before-you-start"]));

  const steps: OnboardingStep[] = [
    {
      id: "before-you-start",
      title: "Before You Start",
      description: "Pre-onboarding requirements and checks",
      details: [
        "Confirm whether the agent has ever been with FFL before",
        "If yes, have them contact their previous upline by phone or email and request a transfer to your team before anything else is done",
        "If the agent has been inactive for 6 months, Pam can email corporate and request an internal transfer. Only proceed with onboarding if the agent has no previous FFL connection",
        "Confirm the agent has a valid check ready",
        "They will also need to purchase E&amp;O insurance and complete an Anti-Money Laundering course during the onboarding process",
      ],
      completed: progress?.beforeYouStartCompleted === 1,
      completedAt: undefined,
    },
    {
      id: "step-1",
      title: "Step 1: Send the HCMS Invite",
      description: "Send onboarding invitation through HCMS",
      details: [
        "The manager sends the onboarding invitation through HCMS using this link: https://hcms.chins.upptop.com/requests/invite-agent",
        "The user type should always be &lt;b&gt;Individual&lt;/b&gt;, not LOA",
        "Information Needed: Email, Salutation, Phone number, First name, Last name, NPN number, Address, Upline name, Compensation level",
      ],
      completed: progress?.step1HcmsInviteSent === 1,
      completedAt: undefined,
    },
    {
      id: "step-2",
      title: "Step 2: Complete Email Sequence & SureLC",
      description: "Agent completes email sequence and SureLC training",
      details: [
        "The manager should tell the agent to watch for the FFL email sequence. The agent should begin with the first email by clicking &lt;b&gt;Start Onboarding&lt;/b&gt;",
        "After onboarding is complete, the agent should use the next email to log in to HCMS by clicking &lt;b&gt;Click to Log In&lt;/b&gt;. Once that is done, the agent should look for the &lt;b&gt;SureLC Link&lt;/b&gt; to begin the contracting process",
        "Important SureLC Instructions:",
        "• SureLC must be completed on a computer; it is not mobile friendly",
        "• If the agent has used SureLC before, they can use the same email address, but they must create a new password that has never been used before in SureLC",
        "• Newly licensed agents must wait 72 hours before submitting a SureLC account",
        "• SureLC is where the agent completes Anti-Money Laundering training and gets E&amp;amp;O insurance if they do not already have it",
      ],
      completed: progress?.step2EmailSequenceCompleted === 1 && progress?.step2SureLcCompleted === 1,
      completedAt: undefined,
    },
    {
      id: "step-3",
      title: "Step 3: Submit Carrier Contracts in NLC",
      description: "Submit contracts to carriers through NLC",
      details: [
        "After SureLC is complete, the agent should submit contracts in NLC. The NLC link is very small in Gold Training, so the manager may need to help the agent find it",
        "The agent should submit for the following carriers: Mutual of Omaha, American Amicable, Americo, Transamerica, Aetna, Corebridge, and Occidental",
        "After the agent completes these steps, the manager can email Pam with the following information:",
        "• Email, Salutation, Phone number, First name, Last name, NPN number, Social Security number, Birth date, Address, Upline name, Compensation level, Resident state",
      ],
      completed: progress?.step3NlcContractsSubmitted === 1,
      completedAt: undefined,
    },
    {
      id: "step-4",
      title: "Step 4: Send Additional Contracts",
      description: "Manager sends additional carrier contracts",
      details: [
        "After Pam has received the required information, the manager can send the following additional contracts: Combined, Royal Arcanum, Ladder, and United Home Life",
      ],
      completed: progress?.step4AdditionalContractsSent === 1,
      completedAt: undefined,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSteps / steps.length) * 100);
  const isCompleted = progress?.onboardingCompleted === 1;

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleStepToggle = (stepId: string, completed: boolean) => {
    const stepMap: Record<string, "beforeYouStart" | "step1" | "step2Email" | "step2SureLC" | "step3" | "step4"> = {
      "before-you-start": "beforeYouStart",
      "step-1": "step1",
      "step-2": "step2Email",
      "step-2-surelc": "step2SureLC",
      "step-3": "step3",
      "step-4": "step4",
    };

    updateStepMutation.mutate({
      step: stepMap[stepId],
      completed: !completed,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading onboarding guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">FFL New Agent Onboarding Guide</h1>
          <p className="text-foreground/60 text-lg">Follow these steps to complete your agent onboarding process</p>
        </div>

        {/* Completion Status */}
        {isCompleted && (
          <Card className="mb-8 border-green-500/50 bg-green-50/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-600">Onboarding Complete! 🎉</p>
                  <p className="text-sm text-foreground/60">You've successfully completed all onboarding steps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <Card className="mb-8 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Progress</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {completedSteps}/{steps.length} Steps
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-semibold text-gold">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {steps.map((step) => (
                  <div key={step.id} className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      step.completed
                        ? "bg-green-500/20 text-green-600"
                        : "bg-foreground/10 text-foreground/40"
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground/70 line-clamp-2">
                      {step.title.split(":")[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.id} className={`border-l-4 transition-all ${
              step.completed
                ? "border-l-green-500 bg-green-50/5"
                : "border-l-gold/30 hover:border-l-gold/60"
            }`}>
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleStepToggle(step.id, step.completed)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 w-6"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${step.completed ? "text-green-600 line-through" : ""}`}>
                          {step.title}
                        </CardTitle>
                        <CardDescription className="mt-1">{step.description}</CardDescription>
                        {step.completedAt && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-foreground/60">
                            <Clock className="h-3 w-3" />
                            <span>Completed on {new Date(step.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-foreground/40 transition-transform ${
                        expandedSteps.has(step.id) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardHeader>
              </button>

              {expandedSteps.has(step.id) && (
                <CardContent className="pt-0 border-t">
                  <div className="mt-4 space-y-3">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="text-gold font-bold mt-0.5">•</div>
                        <p className="text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: detail }} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Checklist */}
        <Card className="mt-8 border-blue-500/20 bg-blue-50/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Quick Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                "Confirm whether the agent has ever been with FFL before",
                "If yes, have them contact their old upline for a transfer",
                "If inactive for 6 months, coordinate with Pam for internal transfer",
                "Confirm the agent has a valid check ready",
                "Send the HCMS invite",
                "Have the agent complete the email sequence",
                "Have the agent complete SureLC on a computer",
                "Make sure AML and E&amp;O are completed",
                "Have the agent submit the required NLC carrier contracts",
                "Send Pam the required agent information",
                "Send the additional contracts",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="text-blue-600 font-bold mt-0.5">✓</div>
                  <span className="text-foreground/70">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mt-8 border-foreground/10">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              If you have any questions about the onboarding process, please reach out to your manager or contact the support team.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">Contact Support</Button>
              <Button variant="outline">Email Manager</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
