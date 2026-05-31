import type { SupportedLocale } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import {
  IntroductionForm,
  type IntroductionBusinessOption,
} from '@/features/introductions/components/introduction-form';

export interface IntroductionFormLabels {
  clientContact: string;
  clientContactHelp: string;
  clientName: string;
  formError: string;
  message: string;
  messageHelp: string;
  optional: string;
  selectBusiness: string;
  selectPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
}

export interface IntroductionRecentRequest {
  businessName: string;
  cityName: string | null;
  countryName: string | null;
  createdAt: Date;
  id: string;
  status: string;
}

export interface DashboardIntroductionTabLabels {
  emptyBusinessesDescription: string;
  emptyBusinessesTitle: string;
  formDescription: string;
  formTitle: string;
  introductionsRestricted: string;
  notSet: string;
  recentCreated: string;
  recentDescription: string;
  recentEmptyDescription: string;
  recentEmptyTitle: string;
  recentStatus: string;
  recentTitle: string;
  upgradeVipCta: string;
  upgradeVipDescription: string;
}

interface DashboardIntroductionTabProps {
  businesses: IntroductionBusinessOption[];
  formLabels: IntroductionFormLabels;
  isVip: boolean;
  labels: DashboardIntroductionTabLabels;
  locale: SupportedLocale;
  recentRequests: IntroductionRecentRequest[];
}

export function DashboardIntroductionTab({
  businesses,
  formLabels,
  isVip,
  labels,
  locale,
  recentRequests,
}: DashboardIntroductionTabProps) {
  if (!isVip) {
    return (
      <div className="rounded-md border border-border/50 bg-white/2 px-5 py-6">
        <p className="text-sm leading-relaxed text-fg/50">{labels.introductionsRestricted}</p>
        <p className="mt-3 text-sm leading-relaxed text-fg/45">{labels.upgradeVipDescription}</p>
      </div>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">{labels.formTitle}</h3>
          <p className="text-sm leading-relaxed text-fg/50">{labels.formDescription}</p>
        </div>

        {businesses.length > 0 ? (
          <IntroductionForm
            businesses={businesses}
            labels={formLabels}
            locale={locale}
            variant="dashboard"
          />
        ) : (
          <div className="rounded-md border border-border/50 bg-white/2 px-5 py-6">
            <h4 className="text-sm font-semibold text-white">{labels.emptyBusinessesTitle}</h4>
            <p className="mt-2 text-sm leading-relaxed text-fg/50">
              {labels.emptyBusinessesDescription}
            </p>
          </div>
        )}
      </div>

      <aside className="rounded-xl border border-border/50 bg-card/20 p-5">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">{labels.recentTitle}</h3>
          <p className="text-xs leading-relaxed text-fg/50">{labels.recentDescription}</p>
        </div>

        {recentRequests.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {recentRequests.map((request) => (
              <li
                className="rounded-md border border-border/50 bg-white/2 px-3 py-3"
                key={request.id}
              >
                <p className="text-sm font-medium text-white">{request.businessName}</p>
                <p className="mt-1 text-xs text-fg/50">
                  {[request.cityName, request.countryName].filter(Boolean).join(' · ') ||
                    labels.notSet}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-fg/45">
                    {labels.recentCreated}: {dateFormatter.format(request.createdAt)}
                  </span>
                  <Badge className="uppercase tracking-wide text-fg/60" variant="outline">
                    {request.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-md border border-border/50 bg-white/2 px-3 py-4">
            <p className="text-sm font-medium text-white">{labels.recentEmptyTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-fg/50">{labels.recentEmptyDescription}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
