import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
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

// Placeholder user object — connect to Supabase auth later
const currentUser = {
  name:     'Aiman Sadeq',
  initials: 'AS',
  title:    'Analyst',
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
      <Routes>
        {/* Auth (standalone, no AppShell) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={
          <AppShell user={currentUser}>
            <HomePage user={currentUser} />
          </AppShell>
        } />
        {/* Certificate verification */}
        <Route path="/verify-certificate" element={<AppShell user={currentUser}><CertificateVerifyPage /></AppShell>} />

        <Route path="/markets" element={<AppShell user={currentUser}><MarketsOverviewPage /></AppShell>} />
        <Route path="/ai" element={<AppShell user={currentUser}><AIAnalystPage /></AppShell>} />
        <Route path="/portfolio" element={<AppShell user={currentUser}><PortfolioPage user={currentUser} /></AppShell>} />
        <Route path="/news" element={<AppShell user={currentUser}><NewsPage /></AppShell>} />
        <Route path="/metals" element={<AppShell user={currentUser}><MetalsPage /></AppShell>} />
        <Route path="/crypto" element={<AppShell user={currentUser}><CryptoPage /></AppShell>} />
        <Route path="/screener" element={<AppShell user={currentUser}><ScreenerPage /></AppShell>} />
        <Route path="/companies" element={<AppShell user={currentUser}><CompaniesPage /></AppShell>} />
        <Route path="/companies/:id" element={<AppShell user={currentUser}><CompanyProfilePage /></AppShell>} />
        <Route path="/filings" element={<AppShell user={currentUser}><ReportsPage /></AppShell>} />
        <Route path="/reports/:id" element={<AppShell user={currentUser}><PDFViewerPage /></AppShell>} />
        <Route path="/analytics" element={<AppShell user={currentUser}><AnalyticsPage /></AppShell>} />
        <Route path="/wizard/type" element={<AppShell user={currentUser}><WizardStep1 /></AppShell>} />
        <Route path="/wizard/first-entity" element={<AppShell user={currentUser}><WizardStep2 /></AppShell>} />
        <Route path="/wizard/second-entity" element={<AppShell user={currentUser}><WizardStep3 /></AppShell>} />
        <Route path="/wizard/metrics" element={<AppShell user={currentUser}><WizardStep4 /></AppShell>} />
        <Route path="/wizard/review" element={<AppShell user={currentUser}><WizardStep5 /></AppShell>} />
        <Route path="/comparison-results" element={<AppShell user={currentUser}><ComparisonResultsPage /></AppShell>} />
        <Route path="/quant" element={<AppShell user={currentUser}><QuantLabPage /></AppShell>} />
        <Route path="/quant/factor-models" element={<AppShell user={currentUser}><FactorModelsPage /></AppShell>} />
        <Route path="/quant/risk" element={<AppShell user={currentUser}><RiskAnalyticsPage /></AppShell>} />
        <Route path="/quant/optimizer" element={<AppShell user={currentUser}><OptimizerPage /></AppShell>} />
        <Route path="/quant/valuation" element={<AppShell user={currentUser}><ValuationPage /></AppShell>} />
        <Route path="/quant/regression" element={<AppShell user={currentUser}><RegressionPage /></AppShell>} />
        <Route path="/quant/gcc-tools" element={<AppShell user={currentUser}><GCCToolsPage /></AppShell>} />
        <Route path="/quant/relative-value" element={<AppShell user={currentUser}><RelativeValuePage /></AppShell>} />
        <Route path="/quant/vision-2030" element={<AppShell user={currentUser}><Vision2030Page /></AppShell>} />
        <Route path="/export" element={<AppShell user={currentUser}><ExcelDownloadPage /></AppShell>} />
        <Route path="/learning" element={<AppShell user={currentUser}><LearningPage /></AppShell>} />
        <Route path="/university" element={<AppShell user={currentUser}><UniversityPage /></AppShell>} />
        <Route path="/settings" element={<AppShell user={currentUser}><SettingsPage /></AppShell>} />
        <Route path="/notifications" element={<AppShell user={currentUser}><NotificationsPage /></AppShell>} />
        <Route path="/watchlist" element={<AppShell user={currentUser}><WatchlistPage /></AppShell>} />
        <Route path="/classroom" element={<AppShell user={currentUser}><ClassroomPage /></AppShell>} />
        <Route path="/reports/export" element={<AppShell user={currentUser}><ReportExportPage /></AppShell>} />
        <Route path="/portfolios" element={<AppShell user={currentUser}><MultiPortfolioPage /></AppShell>} />
        <Route path="/sectors" element={<AppShell user={currentUser}><SectorDashboardPage /></AppShell>} />
        <Route path="/curated" element={<AppShell user={currentUser}><CuratedListsPage /></AppShell>} />
        <Route path="/currency" element={<AppShell user={currentUser}><CurrencyConverterPage /></AppShell>} />
        <Route path="/paths" element={<AppShell user={currentUser}><LearningPathPage /></AppShell>} />
        <Route path="/glossary" element={<AppShell user={currentUser}><GlossaryPage /></AppShell>} />
        <Route path="/pricing" element={<AppShell user={currentUser}><PricingPage /></AppShell>} />
        <Route path="/api-access" element={<AppShell user={currentUser}><ApiAccessPage /></AppShell>} />
        <Route path="/white-label" element={<AppShell user={currentUser}><WhiteLabelPage /></AppShell>} />
        <Route path="/dashboard" element={<AppShell user={currentUser}><CustomDashboardPage /></AppShell>} />
        <Route path="/notification-settings" element={<AppShell user={currentUser}><NotificationSettingsPage /></AppShell>} />
        <Route path="/earnings" element={<AppShell user={currentUser}><EarningsCalendarPage /></AppShell>} />
        <Route path="/net-worth" element={<AppShell user={currentUser}><NetWorthPage /></AppShell>} />
        <Route path="/sharia" element={<AppShell user={currentUser}><ShariaScreeningPage /></AppShell>} />
        <Route path="/community" element={<AppShell user={currentUser}><SocialFeedPage /></AppShell>} />
        <Route path="/copy-trading" element={<AppShell user={currentUser}><CopyTradingPage /></AppShell>} />
        <Route path="/family" element={<AppShell user={currentUser}><FamilyPortfolioPage /></AppShell>} />
        <Route path="/options" element={<AppShell user={currentUser}><OptionsScreenerPage /></AppShell>} />
        <Route path="/cross-listings" element={<AppShell user={currentUser}><CrossListingPage /></AppShell>} />
        <Route path="/ipo-calendar" element={<AppShell user={currentUser}><IPOCalendarPage /></AppShell>} />
        <Route path="/dividends" element={<AppShell user={currentUser}><DividendCalendarPage /></AppShell>} />
        <Route path="/rates" element={<AppShell user={currentUser}><CentralBankRatesPage /></AppShell>} />
        <Route path="/fractional-shares" element={<AppShell user={currentUser}><FractionalSharesPage /></AppShell>} />
        <Route path="/zakat" element={<AppShell user={currentUser}><ZakatReportPage /></AppShell>} />
        <Route path="/order/:ticker" element={<AppShell user={currentUser}><OrderPage /></AppShell>} />

        <Route path="/cma" element={<AppShell user={currentUser}><CMAPage /></AppShell>} />
        <Route path="*" element={<AppShell user={currentUser}><PlaceholderPage title="Page Not Found" /></AppShell>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
