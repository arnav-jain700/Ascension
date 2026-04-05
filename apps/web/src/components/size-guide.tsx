"use client";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-asc-canvas rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-asc-matte">Size Guide</h2>
            <button
              onClick={onClose}
              className="p-2 text-asc-charcoal hover:text-asc-matte transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Size Chart */}
            <div>
              <h3 className="text-lg font-medium text-asc-matte mb-4">T-Shirts</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-asc-border">
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Size</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Chest (cm)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Length (cm)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Shoulder (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XS</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">86-91</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">66-69</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">42-44</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">S</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">96-101</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">71-74</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">46-48</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">M</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">106-111</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">76-79</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">50-52</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">L</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">116-121</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">81-84</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">54-56</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XL</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">126-131</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">86-89</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">58-60</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XXL</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">136-141</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">91-94</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">62-64</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Joggers Size Chart */}
            <div>
              <h3 className="text-lg font-medium text-asc-matte mb-4">Joggers</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-asc-border">
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Size</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Waist (cm)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Length (cm)</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-asc-matte">Hip (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XS</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">71-76</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">96-99</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">86-91</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">S</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">81-86</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">101-104</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">96-101</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">M</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">91-96</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">106-109</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">106-111</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">L</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">101-106</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">111-114</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">116-121</td>
                    </tr>
                    <tr className="border-b border-asc-border">
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XL</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">111-116</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">116-119</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">126-131</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">XXL</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">121-126</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">121-124</td>
                      <td className="py-2 px-3 text-sm text-asc-charcoal">136-141</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Measure */}
            <div>
              <h3 className="text-lg font-medium text-asc-matte mb-4">How to Measure</h3>
              <div className="space-y-3 text-sm text-asc-charcoal">
                <p>
                  <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape measure horizontal.
                </p>
                <p>
                  <strong>Waist:</strong> Measure around your natural waistline, typically where your body bends side to side.
                </p>
                <p>
                  <strong>Hip:</strong> Measure around the fullest part of your hips, keeping the tape measure horizontal.
                </p>
                <p>
                  <strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
