'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { CatalogSnapshot } from '@/lib/cms/catalog';
import { getStaticCatalog } from '@/lib/cms/catalog';

const CatalogContext = createContext<CatalogSnapshot>(getStaticCatalog());

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogSnapshot>(getStaticCatalog());
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('/api/catalog', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: CatalogSnapshot) => setCatalog(data))
      .catch(() => setCatalog(getStaticCatalog()));
  }, []);

  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
