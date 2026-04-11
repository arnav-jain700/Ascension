import { calculateGST, getTaxBreakdown, formatCurrency } from "@/lib/gst";

interface GSTSummaryProps {
  subtotal: number;
  customerState: string;
  category?: string;
}

export function GSTSummary({ subtotal, customerState, category = 'clothing' }: GSTSummaryProps) {
  const gstCalculation = calculateGST(subtotal, customerState, category);
  const taxBreakdown = getTaxBreakdown(gstCalculation);

  return (
    <div className="bg-asc-sand-muted rounded-lg p-6">
      <h3 className="text-lg font-semibold text-asc-matte mb-4">Tax Summary</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-asc-charcoal">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        {taxBreakdown.map((tax, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-asc-charcoal">{tax.name}:</span>
            <span className="font-medium text-sm">{formatCurrency(tax.amount)}</span>
          </div>
        ))}
        
        <div className="border-t border-asc-border pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-asc-matte">Total:</span>
            <span className="font-bold text-lg">{formatCurrency(gstCalculation.total)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-asc-canvas rounded-md border border-asc-border">
        <p className="text-xs text-asc-charcoal leading-relaxed">
          <strong>GST Information:</strong> 
          {customerState === 'TS' ? (
            <span>Same state as seller - CGST + SGST applied</span>
          ) : (
            <span>Different state - IGST applied</span>
          )}
          <br />
          Tax rates: {category} (9% CGST/SGST or 18% IGST)
        </p>
      </div>
    </div>
  );
}
