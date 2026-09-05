import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerPortalComponent from '../../components/CustomerPortal.jsx';

export default function CustomerPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'tok_portal_demo_1042';

  return <CustomerPortalComponent token={token} />;
}
