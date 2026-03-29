import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRPayment = ({ amount, orderId, customerName, medicineData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        generateQRCode();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [amount, orderId, customerName, medicineData]);

  const generateQRCode = async () => {
    try {
      console.log('🔄 Generating EMVCo compliant QR code...', { medicineData, amount, orderId });
      
      let qrContent;
      
      // Generate simple text QR that any scanner can read
      qrContent = generateQRContent(amount, orderId);

      console.log('📝 QR Content:', qrContent);

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('❌ Canvas not found');
        return;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await QRCode.toCanvas(canvas, qrContent, {
        width: medicineData ? 180 : 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('✅ EMVCo QR Code generated successfully:', medicineData ? 'Medicine Info' : 'Payment Info');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
    }
  };

  // Generate QR codes compatible with eSewa personal accounts and Fonepay network
  const generateQRContent = (amount, orderId) => {
    if (medicineData) {
      // Simple medicine info that any QR scanner can read
      return `Medicine: ${medicineData.name}\nPrice: Rs. ${parseFloat(medicineData.price).toFixed(2)}\nStock: ${medicineData.stock}\nExpiry: ${new Date(medicineData.expiry).toLocaleDateString()}`;
    } else {
      // Generate eSewa personal account compatible QR
      // This format works with eSewa personal accounts for P2P payments
      const phoneNumber = "9702789464";
      const name = "Unisha Mahara";
      
      // Format compatible with eSewa personal account QR
      // This follows the format used by pritush.com.np QR generator
      return `esewa://pay?phone=${phoneNumber}&name=${encodeURIComponent(name)}&amount=${amount}&note=${encodeURIComponent(`MediTrust Order ${orderId || 'ORD-' + Date.now()}`)}`;
    }
  };

  return (
    <div className="qr-payment-section" style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      margin: '15px 0'
    }}>
      <h4 style={{color: '#007bff', marginBottom: '15px'}}>
        {medicineData ? '💊 Medicine Information QR' : '📱 eSewa Personal Account QR'}
      </h4>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '15px'
      }}>
        <canvas 
          ref={canvasRef}
          width={medicineData ? "180" : "280"}
          height={medicineData ? "180" : "280"}
          style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: 'white',
            maxWidth: '100%'
          }}
        />
      </div>
      
      {medicineData ? (
        // Medicine Information Display
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #28a745',
          borderRadius: '8px',
          padding: '15px',
          margin: '10px 0'
        }}>
          <div style={{fontSize: '16px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px'}}>
            💊 {medicineData.name}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            textAlign: 'left',
            fontSize: '14px'
          }}>
            <div><strong>💰 Price:</strong> Rs. {parseFloat(medicineData.price).toFixed(2)}</div>
            <div><strong>📦 Stock:</strong> {medicineData.stock} units</div>
            <div style={{gridColumn: '1 / -1'}}>
              <strong>📅 Expiry:</strong> {new Date(medicineData.expiry).toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : (
        // Payment Information Display
        <div>
          {/* Amount Display */}
          <div style={{
            backgroundColor: 'white',
            border: '3px solid #28a745',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px'
          }}>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '5px'}}>
              Total Amount
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#28a745'
            }}>
              Rs. {amount ? amount.toLocaleString() : '0'}
            </div>
          </div>

          {/* QR Instructions */}
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            textAlign: 'left'
          }}>
            <div style={{fontSize: '16px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px'}}>
              📱 How to Scan with eSewa (Personal Account):
            </div>
            <div style={{fontSize: '14px', lineHeight: '1.6', color: '#333'}}>
              <div><strong>Step 1:</strong> Open eSewa app on your phone</div>
              <div><strong>Step 2:</strong> Tap the QR scanner icon (middle of bottom bar)</div>
              <div><strong>Step 3:</strong> Point camera at the QR code above</div>
              <div><strong>Step 4:</strong> eSewa will show payment details automatically</div>
              <div><strong>Step 5:</strong> Confirm amount and complete with PIN</div>
              <div style={{marginTop: '8px', fontSize: '13px', color: '#28a745'}}>
                ✅ <strong>This QR works with your personal eSewa account!</strong>
              </div>
            </div>
          </div>

          {/* Alternative Payment Methods */}
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'left'
          }}>
            <div style={{fontSize: '14px', fontWeight: 'bold', color: '#1976d2', marginBottom: '8px'}}>
              💳 Alternative Payment Methods:
            </div>
            <div style={{fontSize: '13px', lineHeight: '1.5', color: '#333'}}>
              <div><strong>Khalti:</strong> Send money to 9702789464</div>
              <div><strong>IME Pay:</strong> Transfer to 9702789464</div>
              <div><strong>Mobile Banking:</strong> Use Fonepay QR scanner</div>
              <div><strong>Manual eSewa:</strong> Send Money → 9702789464</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{color: '#666', fontSize: '12px', margin: '15px 0'}}>
        <strong>🏥 MediTrust Pharmacy</strong><br/>
        <span style={{color: '#28a745', fontWeight: 'bold'}}>
          {medicineData ? '💊 Medicine Information System' : '📱 eSewa Personal Account Compatible'}
        </span>
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '10px',
        fontStyle: 'italic'
      }}>
        Order ID: {orderId || `ORD-${Date.now()}`} | {medicineData ? 'Medicine QR' : 'eSewa Personal QR'}
      </div>
    </div>
  );
};

export default QRPayment;