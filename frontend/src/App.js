import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import DisclaimerGate from './components/shared/DisclaimerGate';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ScreenerPage from './pages/ScreenerPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import ReportsPage from './pages/ReportsPage';
import PDFViewerPage from './pages/PDFViewerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ComparisonResultsPage from './pages/ComparisonResultsPage';
import MetalsPage from './pages/MetalsPage';
import CryptoPage from './pages/CryptoPage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import WizardStep1 from './pages/wizard/WizardStep1';
import WizardStep2 from './pages/wizard/WizardStep2';
import WizardStep3 from './pages/wizard/WizardStep3';
import WizardStep4 from './pages/wizard/WizardStep4';
import WizardStep5 from './pages/wizard/WizardStep5';

// New pages
import LearningPage from './pages/LearningPage';
import UniversityPage from './pages/UniversityPage';
import CertificateVerifyPage from './pages/CertificateVerifyPage';
import AIAnalystPage from './pages/AIAnalystPage';
import SettingsPage from './pages/SettingsPage';
import ExcelDownloadPage from './pages/ExcelDownloadPage';
import CMAPage from './pages/CMAPage';
import MarketsOverviewPage from './pages/MarketsOverviewPage';
import NotificationsPage from './pages/NotificationsPage';
import WatchlistPage from './pages/WatchlistPage';
import ClassroomPage from './pages/ClassroomPage';
import ReportExportPage from './pages/ReportExportPage';
import MultiPortfolioPage from './pages/MultiPortfolioPage';
import SectorDashboardPage from './pages/SectorDashboardPage';
import CuratedListsPage from './pages/CuratedListsPage';
import CurrencyConverterPage from './pages/CurrencyConverterPage';
import LearningPathPage from './pages/LearningPathPage';
import GlossaryPage from './pages/GlossaryPage';
import PricingPage from './pages/PricingPage';
import ApiAccessPage from './pages/ApiAccessPage';
import WhiteLabelPage from './pages/WhiteLabelPage';
import CustomDashboardPage from './pages/CustomDashboardPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import EarningsCalendarPage from './pages/EarningsCalendarPage';
import NetWorthPage from './pages/NetWorthPage';
import ShariaScreeningPage from './pages/ShariaScreeningPage';
import SocialFeedPage from './pages/SocialFeedPage';
import CopyTradingPage from './pages/CopyTradingPage';
import FamilyPortfolioPage from './pages/FamilyPortfolioPage';
import OptionsScreenerPage from './pages/OptionsScreenerPage';
import CrossListingPage from './pages/CrossListingPage';
import IPOCalendarPage from './pages/IPOCalendarPage';
import DividendCalendarPage from './pages/DividendCalendarPage';
import CentralBankRatesPage from './pages/CentralBankRatesPage';
import FractionalSharesPage from './pages/FractionalSharesPage';
import ZakatReportPage from './pages/ZakatReportPage';

// Quant Lab pages
import QuantLabPage from './pages/quant/QuantLabPage';
import FactorModelsPage from './pages/quant/FactorModelsPage';
import RiskAnalyticsPage from './pages/quant/RiskAnalyticsPage';
import OptimizerPage from './pages/quant/OptimizerPage';
import ValuationPage from './pages/quant/ValuationPage';
import RegressionPage from './pages/quant/RegressionPage';
import GCCToolsPage from './pages/quant/GCCToolsPage';
import RelativeValuePage from './pages/quant/RelativeValuePage';
import Vision2030Page from './pages/quant/Vision2030Page';
import OrderPage from './pages/OrderPage';

// Fallback identity used for the app chrome when nobody is signed in.
//
// This was previously a specific person's name ('Aiman Sadeq', 'Analyst'),
// hardcoded and shown to every visitor as though they were that user. Use a
// neutral guest identity instead — AuthContext supplies the real user once
// they sign in.
const guestUser = {
  name:     'Guest',
  initials: 'G',
  title:    'Guest',
};

// Placeholder page for routes not yet built
function PlaceholderPage({ title }) {
  return (
    <div className="px-5 py-12 text-center animate-fade-in">
      <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-2" style={{ color: 'var(--text-3)' }}>Coming Soon</p>
      <h2 className="font-head text-[22px] font-bold" style={{ color: 'var(--navy)' }}>{title}</h2>
      <p className="text-[12px] mt-2" style={{ color: 'var(--text-3)' }}>This page is being migrated.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      {/* Blocking educational-use notice. Renders above everything until accepted. */}
      <DisclaimerGate />
      <Routes>
        {/* Auth (standalone, no AppShell) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={
          <AppShell user={guestUser}>
            <HomePage user={guestUser} />
          </AppShell>
        } />
        {/* Certificate verification */}
        <Route path="/verify-certificate" element={<AppShell user={guestUser}><CertificateVerifyPage /></AppShell>} />

        <Route path="/markets" element={<AppShell user={guestUser}><MarketsOverviewPage /></AppShell>} />
        <Route path="/ai" element={<AppShell user={guestUser}><AIAnalystPage /></AppShell>} />
        <Route path="/portfolio" element={<AppShell user={guestUser}><PortfolioPage user={guestUser} /></AppShell>} />
        <Route path="/news" element={<AppShell user={guestUser}><NewsPage /></AppShell>} />
        <Route path="/metals" element={<AppShell user={guestUser}><MetalsPage /></AppShell>} />
        <Route path="/crypto" element={<AppShell user={guestUser}><CryptoPage /></AppShell>} />
        <Route path="/screener" element={<AppShell user={guestUser}><ScreenerPage /></AppShell>} />
        <Route path="/companies" element={<AppShell user={guestUser}><CompaniesPage /></AppShell>} />
        <Route path="/companies/:id" element={<AppShell user={guestUser}><CompanyProfilePage /></AppShell>} />
        <Route path="/filings" element={<AppShell user={guestUser}><ReportsPage /></AppShell>} />
        <Route path="/reports/:id" element={<AppShell user={guestUser}><PDFViewerPage /></AppShell>} />
        <Route path="/analytics" element={<AppShell user={guestUser}><AnalyticsPage /></AppShell>} />
        <Route path="/wizard/type" element={<AppShell user={guestUser}><WizardStep1 /></AppShell>} />
        <Route path="/wizard/first-entity" element={<AppShell user={guestUser}><WizardStep2 /></AppShell>} />
        <Route path="/wizard/second-entity" element={<AppShell user={guestUser}><WizardStep3 /></AppShell>} />
        <Route path="/wizard/metrics" element={<AppShell user={guestUser}><WizardStep4 /></AppShell>} />
        <Route path="/wizard/review" element={<AppShell user={guestUser}><WizardStep5 /></AppShell>} />
        <Route path="/comparison-results" element={<AppShell user={guestUser}><ComparisonResultsPage /></AppShell>} />
        <Route path="/quant" element={<AppShell user={guestUser}><QuantLabPage /></AppShell>} />
        <Route path="/quant/factor-models" element={<AppShell user={guestUser}><FactorModelsPage /></AppShell>} />
        <Route path="/quant/risk" element={<AppShell user={guestUser}><RiskAnalyticsPage /></AppShell>} />
        <Route path="/quant/optimizer" element={<AppShell user={guestUser}><OptimizerPage /></AppShell>} />
        <Route path="/quant/valuation" element={<AppShell user={guestUser}><ValuationPage /></AppShell>} />
        <Route path="/quant/regression" element={<AppShell user={guestUser}><RegressionPage /></AppShell>} />
        <Route path="/quant/gcc-tools" element={<AppShell user={guestUser}><GCCToolsPage /></AppShell>} />
        <Route path="/quant/relative-value" element={<AppShell user={guestUser}><RelativeValuePage /></AppShell>} />
        <Route path="/quant/vision-2030" element={<AppShell user={guestUser}><Vision2030Page /></AppShell>} />
        <Route path="/export" element={<AppShell user={guestUser}><ExcelDownloadPage /></AppShell>} />
        <Route path="/learning" element={<AppShell user={guestUser}><LearningPage /></AppShell>} />
        <Route path="/university" element={<AppShell user={guestUser}><UniversityPage /></AppShell>} />
        <Route path="/settings" element={<AppShell user={guestUser}><SettingsPage /></AppShell>} />
        <Route path="/notifications" element={<AppShell user={guestUser}><NotificationsPage /></AppShell>} />
        <Route path="/watchlist" element={<AppShell user={guestUser}><WatchlistPage /></AppShell>} />
        <Route path="/classroom" element={<AppShell user={guestUser}><ClassroomPage /></AppShell>} />
        <Route path="/reports/export" element={<AppShell user={guestUser}><ReportExportPage /></AppShell>} />
        <Route path="/portfolios" element={<AppShell user={guestUser}><MultiPortfolioPage /></AppShell>} />
        <Route path="/sectors" element={<AppShell user={guestUser}><SectorDashboardPage /></AppShell>} />
        <Route path="/curated" element={<AppShell user={guestUser}><CuratedListsPage /></AppShell>} />
        <Route path="/currency" element={<AppShell user={guestUser}><CurrencyConverterPage /></AppShell>} />
        <Route path="/paths" element={<AppShell user={guestUser}><LearningPathPage /></AppShell>} />
        <Route path="/glossary" element={<AppShell user={guestUser}><GlossaryPage /></AppShell>} />
        <Route path="/pricing" element={<AppShell user={guestUser}><PricingPage /></AppShell>} />
        <Route path="/api-access" element={<AppShell user={guestUser}><ApiAccessPage /></AppShell>} />
        <Route path="/white-label" element={<AppShell user={guestUser}><WhiteLabelPage /></AppShell>} />
        <Route path="/dashboard" element={<AppShell user={guestUser}><CustomDashboardPage /></AppShell>} />
        <Route path="/notification-settings" element={<AppShell user={guestUser}><NotificationSettingsPage /></AppShell>} />
        <Route path="/earnings" element={<AppShell user={guestUser}><EarningsCalendarPage /></AppShell>} />
        <Route path="/net-worth" element={<AppShell user={guestUser}><NetWorthPage /></AppShell>} />
        <Route path="/sharia" element={<AppShell user={guestUser}><ShariaScreeningPage /></AppShell>} />
        <Route path="/community" element={<AppShell user={guestUser}><SocialFeedPage /></AppShell>} />
        <Route path="/copy-trading" element={<AppShell user={guestUser}><CopyTradingPage /></AppShell>} />
        <Route path="/family" element={<AppShell user={guestUser}><FamilyPortfolioPage /></AppShell>} />
        <Route path="/options" element={<AppShell user={guestUser}><OptionsScreenerPage /></AppShell>} />
        <Route path="/cross-listings" element={<AppShell user={guestUser}><CrossListingPage /></AppShell>} />
        <Route path="/ipo-calendar" element={<AppShell user={guestUser}><IPOCalendarPage /></AppShell>} />
        <Route path="/dividends" element={<AppShell user={guestUser}><DividendCalendarPage /></AppShell>} />
        <Route path="/rates" element={<AppShell user={guestUser}><CentralBankRatesPage /></AppShell>} />
        <Route path="/fractional-shares" element={<AppShell user={guestUser}><FractionalSharesPage /></AppShell>} />
        <Route path="/zakat" element={<AppShell user={guestUser}><ZakatReportPage /></AppShell>} />
        <Route path="/order/:ticker" element={<AppShell user={guestUser}><OrderPage /></AppShell>} />

        <Route path="/cma" element={<AppShell user={guestUser}><CMAPage /></AppShell>} />
        <Route path="*" element={<AppShell user={guestUser}><PlaceholderPage title="Page Not Found" /></AppShell>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
