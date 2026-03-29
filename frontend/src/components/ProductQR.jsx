import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const ProductQR = ({ product, size = 150, showInfo = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (product && canvasRef.current) {
      generateProductQR();
    }
  }, [product, size]);

  const generateProductQR = async () => {
    try {
      // Create QR data with product information
      const qrData = {
        type: 'PRODUCT',
        id: product._id,
        name: product.name,
        price: product.price,
        batchNumber: product.batchNumber,
        category: product.category,
        manufacturer: product.manufacturer,
        timestamp: Date.now()
      };

      const qrString = JSON.stringify(qrData);
      console.log('Generating QR for product:', product.name, qrString);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await QRCode.toCanvas(canvas, qrString, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      console.log('✅ Product QR generated successfully for:', product.name);
    } catch (error) {
      console.error('❌ Error generating product QR:', error);
    }
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const printQR = () => {
    const canvas = canvasRef.current;
    const printWindow = window.open('', '_blank');
    const img = canvas.toDataURL();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Product QR - ${product.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
            }
            .qr-container {
              border: 2px solid #333;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .product-info {
              margin-top: 15px;
              font-size: 14px;
            }
            .product-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${img}" alt="Product QR Code" />
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div>Price: Rs. ${parseFloat(product.price).toFixed(2)}</div>
              <div>Batch: ${product.batchNumber}</div>
              <div>Category: ${product.category}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  if (!product) return null;

  return (
    <div className="product-qr-container" style={{
      display: 'inline-block',
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      textAlign: 'center',
      margin: '10px'
    }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      
      {showInfo && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '5px'
          }}>
            {product.name}
          </div>
          <div>Price: Rs. {parseFloat(product.price).toFixed(2)}</div>
          <div>Batch: {product.batchNumber}</div>
          <div>Stock: {product.quantity}</div>
        </div>
      )}
      
      <div style={{
        marginTop: '10px',
        display: 'flex',
        gap: '5px',
        justifyContent: 'center'
      }}>
        <button
          onClick={downloadQR}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📥 Download
        </button>
        <button
          onClick={printQR}
          style={{
            padding: '5px 10px',
            fontSize: '11px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
};

export default ProductQR;