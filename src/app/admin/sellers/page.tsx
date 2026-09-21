import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
} from "@/components/admin/styles";
import { formatDate, one, requireAdmin } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";
import { approveSeller, setSellerStatus } from "@/app/admin/actions";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
] as
const;

type SellerItem = {
  id: string;
  store_name: string;
  description: string | null;
  phone: string | null;
  status: string;
  commission_rate: number | string;
  created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null } [] | null;
};

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise < { status ? : string } > ;
}) {
  const { status: statusParam } = await searchParams;
  const status = TABS.some((t) => t.key === statusParam) ?
    (statusParam as string) :
    "pending";
  
  const { supabase } = await requireAdmin("/admin/sellers");
  
  const { data } = await supabase
    .from("sellers")
    .select(
      "id, store_name, description, phone, status, commission_rate, created_at, profiles(full_name)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false });
  
  const sellers = (data ?? []) as unknown as SellerItem[];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Sellers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve applications and manage commission rates.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/sellers?status=${tab.key}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {sellers.length === 0 ? (
        <div className={`${cardClass} px-6 py-14 text-center`}>
          <p className="font-medium">No {status} sellers</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sellers.map((seller) => {
            const owner = one(seller.profiles)?.full_name;
            const rate = Number(seller.commission_rate);

            return (
              <li key={seller.id} className={`${cardClass} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium">{seller.store_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {[owner, seller.phone].filter(Boolean).join(" · ") ||
                        "No contact details"}
                    </p>
                  </div>
                  <StatusBadge status={seller.status} />
                </div>

                {seller.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {seller.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Applied {formatDate(seller.created_at)}
                  {seller.status !== "pending" && ` · Commission ${rate}%`}
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {seller.status === "pending" && (
                    <>
                      <form action={approveSeller} className="flex items-end gap-2">
                        <input type="hidden" name="seller_id" value={seller.id} />
                        <div className="space-y-1">
                          <label
                            htmlFor={`rate-${seller.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Commission %
                          </label>
                          <input
                            id={`rate-${seller.id}`}
                            name="commission"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            required
                            placeholder="e.g. 10"
                            className={cn(inputClass, "w-28")}
                          />
                        </div>
                        <button type="submit" className={btnPrimary}>
                          Approve
                        </button>
                      </form>
                      <form action={setSellerStatus}>
                        <input type="hidden" name="seller_id" value={seller.id} />
                        <input type="hidden" name="status" value="suspended" />
                        <button type="submit" className={btnDanger}>
                          Reject
                        </button>
                      </form>
                    </>
                  )}

                  {seller.status === "approved" && (
                    <>
                      <form action={approveSeller} className="flex items-end gap-2">
                        <input type="hidden" name="seller_id" value={seller.id} />
                        <div className="space-y-1">
                          <label
                            htmlFor={`rate-${seller.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Commission %
                          </label>
                          <input
                            id={`rate-${seller.id}`}
                            name="commission"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            required
                            defaultValue={rate}
                            className={cn(inputClass, "w-28")}
                          />
                        </div>
                        <button type="submit" className={btnGhost}>
                          Update
                        </button>
                      </form>
                      <form action={setSellerStatus}>
                        <input type="hidden" name="seller_id" value={seller.id} />
                        <input type="hidden" name="status" value="suspended" />
                        <button type="submit" className={btnDanger}>
                          Suspend
                        </button>
                      </form>
                    </>
                  )}

                  {seller.status === "suspended" && (
                    <form action={setSellerStatus}>
                      <input type="hidden" name="seller_id" value={seller.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" className={btnPrimary}>
                        Reactivate
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}