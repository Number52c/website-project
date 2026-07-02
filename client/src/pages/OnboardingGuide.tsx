import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function OnboardingGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('before-you-start');

  const sections = [
    {
      id: 'before-you-start',
      title: 'Before You Start',
      content: `Before onboarding an agent into HCMS, ask whether they have ever been with FFL before. If they have, they must contact their previous upline by phone or email and request a transfer to your team before anything else is done.

If the agent has been inactive for 6 months, they are considered a free agent. In that case, Pam can email corporate and request an internal transfer. Only proceed with onboarding if the agent has no previous FFL connection.

Before starting, the agent should also be told they must have a voided check ready. They will also need to purchase E&amp;O insurance and complete an Anti-Money Laundering course during the onboarding process.`,
    },
    {
      id: 'step-1',
      title: 'Step 1: Send the HCMS Invite',
      content: `The manager sends the onboarding invitation through HCMS using this link:
https://hcms.chins.uptatop.com/requests/invite-agent

The user type should always be <b>Individual</b>, not LOA.

<b>Information Needed:</b>
• Email
• Salutation
• Phone number
• First name
• Last name
• NPN number
• Address
• Upline name
• Compensation level`,
    },
    {
      id: 'step-2',
      title: 'Step 2: Complete Email Sequence and SureLC',
      content: `The manager should tell the agent to watch for the FFL email sequence. The agent should begin with the first email by clicking <b>Start Onboarding</b>. After onboarding is complete, the agent should use the next email to log in to HCMS by clicking <b>Click to Log In</b>. Once that is done, the agent should look for the first email and click the <b>SureLC Link</b> to begin the contracting process.

<b>Important SureLC Instructions:</b>
• SureLC must be completed on a computer; it is not mobile friendly
• If the agent has used SureLC before, they can use the same email address, but they must create a new password that has never been used before in SureLC
• Newly licensed agents must wait 72 hours before submitting a SureLC account
• SureLC is where the agent completes Anti-Money Laundering training and gets E&amp;O insurance if they do not already have it`,
    },
    {
      id: 'step-3',
      title: 'Step 3: Submit Carrier Contracts in NLC',
      content: `After SureLC is complete, the agent should submit contracts in NLC. The NLC link is very small in Gold Training, so the manager may need to help the agent find it. The agent should submit for the following carriers: Mutual of Omaha, American Amicable, Americo, Transamerica, Aetna, Corebridge, and Occidental.

After the agent completes these steps, the manager can email Pam with the following information:

<b>Manager Sends Pam:</b>
• Email
• Salutation
• Phone number
• First name
• Last name
• NPN number
• Social Security number
• Birth date
• Address
• Upline name
• Compensation level
• Resident state`,
    },
    {
      id: 'step-4',
      title: 'Step 4: Send Additional Contracts',
      content: `After Pam has received the required information, the manager can send the following additional contracts:
Combined, Royal Arcanum, Ladder, and United Home Life`,
    },
    {
      id: 'quick-checklist',
      title: 'Quick Checklist',
      content: `Before you start the onboarding process, verify:
✓ Confirm whether the agent has ever been with FFL before
✓ If yes, have them contact their old upline for a transfer
✓ If inactive for 6 months, coordinate with Pam for internal transfer
✓ Confirm the agent has a voided check
✓ Send the HCMS invite
✓ Have the agent complete the email sequence
✓ Have the agent complete SureLC on a computer
✓ Make sure AML and E&amp;O are completed
✓ Have the agent submit the required NLC carrier contracts
✓ Send Pam the required agent information
✓ Send the additional contracts`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FFL New Agent Onboarding Guide</h1>
          <p className="text-slate-400">Follow these steps to get your new agents contracted and ready to sell</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="bg-slate-800 border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-700/50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-white text-left">{section.title}</h2>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    expandedSection === section.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === section.id && (
                <div className="px-6 pb-6 pt-0 border-t border-slate-700">
                  <div
                    className="text-slate-300 space-y-3 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Make sure to follow each step in order. If you have questions about any step, contact your upline or Pam for clarification.
          </p>
        </div>
      </div>
    </div>
  );
}
