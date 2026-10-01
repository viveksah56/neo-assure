export const SALE_TYPES = [
    { value: "standard", label: "Goods at standard rate (default)" },
    { value: "reduced", label: "Goods at reduced rate" },
    { value: "zero", label: "Zero-rated goods" },
    { value: "exempt", label: "Exempt goods" },
    { value: "services", label: "Services" },
];
export const UOMS = ["PCS", "KG", "LTR", "MTR", "BOX", "SET"];
export const GST_RATES = ["0", "5", "10", "18"];
export const STATUSES = ["Draft", "Pending approval", "Sent"];

/** SR# options depend on the selected SRO. */
export const SRO_OPTIONS: Record<string, string[]> = {
    "SRO 297(I)/2023": ["1", "2", "3"],
    "SRO 1125(I)/2011": ["4", "5"],
    "SRO 551(I)/2008": ["12", "13", "14"],
};

export const CLIENTS = [
    { id: "c1", name: "Alpine Traders Pvt Ltd" },
    { id: "c2", name: "Himal Electric Supplies" },
    { id: "c3", name: "Everest Hardware Co." },
];

/** Product catalog — powers description suggestions and auto-fill. */
export const CATALOG = [
    { name: "LED Driver 24V", hsCode: "8504.4090", uom: "PCS", price: "1450" },
    { name: "Copper Wire 2.5mm", hsCode: "8544.4900", uom: "MTR", price: "85" },
    { name: "Circuit Breaker 32A", hsCode: "8536.2000", uom: "PCS", price: "980" },
    { name: "PVC Conduit 20mm", hsCode: "3917.2300", uom: "MTR", price: "62" },
    { name: "Solar Inverter 5kW", hsCode: "8504.4010", uom: "PCS", price: "78500" },
    { name: "Cable Tie Pack (100)", hsCode: "3926.9090", uom: "BOX", price: "240" },
];

/* Option-shaped lists for <SelectInputField/> (module-level so references stay stable → memo works). */
type Opt = { value: string; label: string };
const toOpts = (xs: string[], suffix = ""): Opt[] => xs.map((x) => ({ value: x, label: x + suffix }));
export const GST_RATE_OPTIONS = toOpts(GST_RATES, "%");
export const UOM_OPTIONS = toOpts(UOMS);
export const STATUS_OPTIONS = toOpts(STATUSES);
export const SRO_LIST_OPTIONS = toOpts(Object.keys(SRO_OPTIONS));
export const SR_NO_OPTIONS: Record<string, Opt[]> = Object.fromEntries(
    Object.entries(SRO_OPTIONS).map(([k, v]) => [k, toOpts(v)]),
);
export const CLIENT_OPTIONS = (clients: { id: string; name: string }[]): Opt[] =>
    clients.map((c) => ({ value: c.id, label: c.name }));
