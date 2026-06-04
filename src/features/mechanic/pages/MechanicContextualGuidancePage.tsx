import { useLocation } from 'react-router-dom';
import {
  MechanicContextualRouteGuidance,
  type MechanicContextualGuidanceVariant,
} from '@/features/mechanic/components/MechanicContextualRouteGuidance';
import { ROUTES } from '@/routes/routePaths';

function resolveVariant(pathname: string): MechanicContextualGuidanceVariant {
  if (pathname.startsWith(ROUTES.MECHANIC_RECORD_WORK_HOME)) {
    return 'record-work';
  }
  return 'service-detail';
}

export function MechanicContextualGuidancePage() {
  const { pathname } = useLocation();
  return <MechanicContextualRouteGuidance variant={resolveVariant(pathname)} />;
}
