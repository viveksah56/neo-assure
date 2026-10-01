import InvoiceHeaders from "@/components/invoice/invoice-headers";
import InvoiceTable from "@/components/invoice/invoice-table";

export default function InvoicePage() {
    return (
        <div className="flex min-h-dvh w-full min-w-0 flex-col bg-background">
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
                <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
                    <div className="grid min-w-0 gap-0.5">
                        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                            Invoices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create an invoice and manage its line items.
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full min-w-0 max-w-screen-2xl flex-1 flex-col gap-8 px-4 pb-12 pt-2 sm:gap-10 sm:px-6 lg:gap-12 lg:px-10">
                <InvoiceHeaders />
                <InvoiceTable />
            </main>
        </div>
    );
}