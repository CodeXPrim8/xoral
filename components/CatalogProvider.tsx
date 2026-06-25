'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CatalogSnapshot } from '@/lib/cms/catalog';
import { getStaticCatalog } from '@/lib/cms/catalog';

const CatalogContext = createContext<CatalogSnapshot>(getStaticCatalog());

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [catalog, setCatalog] = useState<CatalogSnapshot>(getStaticCatalog());

  useEffect(() => {
    fetch('/api/catalog', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: CatalogSnapshot) => setCatalog(data))
      .catch(() => setCatalog(getStaticCatalog()));
  }, [pathname]);

  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
