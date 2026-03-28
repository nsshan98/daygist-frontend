/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ComponentProps, ComponentType, FC, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

// Types
type ProvidersProps = { children: ReactNode };
type Providers = [ComponentType<any>, ComponentProps<any>?][];

// Combine providers
const combineProviders = (providers: Providers): FC<ProvidersProps> =>
  providers.reduce(
    (AccumulatedProviders, [Provider, props = {}]) =>
      // eslint-disable-next-line react/display-name
      ({ children }) =>
      (
        <AccumulatedProviders>
          <Provider {...props}>
            <>{children}</>
          </Provider>
        </AccumulatedProviders>
      ),
    ({ children }) => <>{children}</>
  );

// ================================ Providers =====================================//

const Providers = ({ children }: ProvidersProps) => {
  const queryClient = getQueryClient();

  // Combine providers
  const AllProviders = combineProviders([
    [QueryClientProvider, { client: queryClient }],
    [ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true }],
  ]);

  return (
    <AllProviders>
      {children}
      <Toaster />
    </AllProviders>
  );
};
export default Providers;
