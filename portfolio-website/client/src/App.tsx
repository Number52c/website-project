import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Quote from "./pages/Quote";
import Contact from "./pages/Contact";
import Reviews from "./pages/Reviews";
import PortalLogin from "./pages/PortalLogin";
import PortalDashboard from "@/pages/PortalDashboard";
import PortalProfile from "@/pages/PortalProfile";
import PortalPolicyDetail from "./pages/PortalPolicyDetail";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDashboardPINWrapper from "@/pages/AdminDashboardPINWrapper";
import AgentLogin from "@/pages/AgentLogin";
import AgentChangePassword from "@/pages/AgentChangePassword";
import AgentDashboard from "./pages/AgentDashboard";
import AgentOnboarding from "./pages/AgentOnboarding";
import { OnboardingGuide } from "./pages/OnboardingGuide";
import TenantDemo from "./pages/TenantDemo";
import InsuranceCalculator from "./pages/InsuranceCalculator";
import Teachers from "./pages/Teachers";
import Barbers from "./pages/Barbers";
import Professionals from "./pages/Professionals";
import SalonAndBeautyProfessionals from "./pages/SalonAndBeautyProfessionals";
import Realtors from "./pages/Realtors";
import AgentMetricsDashboard from "./pages/AgentMetricsDashboard";
import OrtizDashboard from "./pages/OrtizDashboard";
import DashboardPortal from "./pages/DashboardPortal";
import OrtizPINDashboard from "./pages/OrtizPINDashboard";
import OrtizPINEntry from "./pages/OrtizPINEntry";
import StickyCTABar from "./components/StickyCTABar";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import AgentCarrierResources from "./pages/AgentCarrierResources";


// SEO Landing Pages
import LifeInsurance from "./pages/seo/LifeInsurance";
import FinalExpenseInsurance from "./pages/seo/FinalExpenseInsurance";
import Annuities from "./pages/seo/Annuities";
import WholeLifeInsurance from "./pages/seo/WholeLifeInsurance";
import TermLifeInsurance from "./pages/seo/TermLifeInsurance";

// Blog / Resource Center
import Blog from "./pages/seo/Blog";
import BlogHowMuchLifeInsurance from "./pages/seo/BlogHowMuchLifeInsurance";
import BlogFinalExpenseVsPrepaid from "./pages/seo/BlogFinalExpenseVsPrepaid";
import BlogFixedIndexAnnuity from "./pages/seo/BlogFixedIndexAnnuity";
import BlogTermVsWholeLife from "./pages/seo/BlogTermVsWholeLife";
import BlogSeniorsOver50 from "./pages/seo/BlogSeniorsOver50";
import BlogPreExistingConditions from "./pages/seo/BlogPreExistingConditions";
import BlogWhyParentsNeedInsurance from "./pages/seo/BlogWhyParentsNeedInsurance";
import BlogGradedVsGuaranteed from "./pages/seo/BlogGradedVsGuaranteed";
import CaseStudyDetail from "./pages/CaseStudyDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/services"} component={Services} />
      <Route path={"/about"} component={About} />
      <Route path={"/quote"} component={Quote} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/calculator"} component={InsuranceCalculator} />
      <Route path={"/professionals"} component={Professionals} />
      <Route path={"/teachers"} component={Teachers} />
      <Route path={"/barbers"} component={Barbers} />
      <Route path={"/salon-and-beauty-professionals"} component={SalonAndBeautyProfessionals} />
      <Route path={"/salon-owners"} component={SalonAndBeautyProfessionals} />
      <Route path={"/realtors"} component={Realtors} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/portal/login"} component={PortalLogin} />
      <Route path={"/portal"} component={PortalDashboard} />
      <Route path={"/portal/profile"} component={PortalProfile} />
      <Route path={"/portal/policy/:id"} component={PortalPolicyDetail} />
      <Route path="/admin" component={AdminDashboardPINWrapper} />
      <Route path="/agent/login" component={AgentLogin} />
      <Route path="/agent/change-password" component={AgentChangePassword} />
      <Route path="/agent/dashboard" component={AgentDashboard} />
      <Route path="/agent/onboarding" component={AgentOnboarding} />
      <Route path="/agent/guide" component={OnboardingGuide} />
      <Route path="/admin/guide" component={OnboardingGuide} />
      <Route path="/agent/metrics" component={AgentMetricsDashboard} />
      <Route path="/agent/carrier-resources" component={AgentCarrierResources} />
      <Route path="/admin/ortiz" component={AdminDashboardPINWrapper} />
      <Route path="/dashboards" component={DashboardPortal} />
      <Route path="/ortiz-pin" component={OrtizPINDashboard} />
      <Route path="/ortiz" component={OrtizPINEntry} />
      <Route path={"agent"} component={AgentDashboard} />
      <Route path={"/demo/tenants"} component={TenantDemo} />

      {/* SEO Landing Pages */}
      <Route path={"/life-insurance-corpus-christi"} component={LifeInsurance} />
      <Route path={"/final-expense-insurance"} component={FinalExpenseInsurance} />
      <Route path={"/annuities-corpus-christi"} component={Annuities} />
      <Route path={"/whole-life-insurance"} component={WholeLifeInsurance} />
      <Route path={"/term-life-insurance"} component={TermLifeInsurance} />

      {/* Case Studies */}
      <Route path={"/case-studies/:slug"} component={CaseStudyDetail} />

      {/* Blog / Resource Center */}
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/how-much-life-insurance-do-i-need"} component={BlogHowMuchLifeInsurance} />
      <Route path={"/blog/final-expense-vs-prepaid-funeral"} component={BlogFinalExpenseVsPrepaid} />
      <Route path={"/blog/what-is-fixed-index-annuity"} component={BlogFixedIndexAnnuity} />
      <Route path={"/blog/term-vs-whole-life-insurance"} component={BlogTermVsWholeLife} />
      <Route path={"/blog/life-insurance-seniors-over-50"} component={BlogSeniorsOver50} />
      <Route path={"/blog/life-insurance-pre-existing-conditions"} component={BlogPreExistingConditions} />
      <Route path={"/blog/why-parents-need-life-insurance"} component={BlogWhyParentsNeedInsurance} />
      <Route path={"/blog/graded-vs-guaranteed-issue"} component={BlogGradedVsGuaranteed} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <StickyCTABar />
          <SessionTimeoutWarning />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
