module.exports = (invoice) => `
<!DOCTYPE html>
<html>
<head>
    <title>Tax Invoice - ${invoice.customername}</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            line-height: 1.3;
            font-size: 12px;
        }
        .container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15px;
            box-sizing: border-box;
            border: 1px solid #000;
        }
        .document-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            position: relative;
        }
        .original-copy {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 12px;
        }
        .header-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            border-bottom: 1px solid #000;
        }
        .company-info {
            padding: 5px;
            border-right: 2px solid #000;
        }
        .company-info h1 {
            font-size: 16px;
            margin: 0 0 5px 0;
            font-weight: bold;
        }
        .company-info p {
            margin: 2px 0;
            font-size: 12px;
        }
        .invoice-meta {
            padding: 5px;
        }
        .invoice-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-meta-table td {
            padding: 2px;
            border: 1px solid #000;
        }
        .invoice-meta-table .shipped-to {
            height: 60px;
            vertical-align: top;
        }
        .billed-to {
            padding: 5px;
            border-bottom: 1px solid #000;
        }
        .billed-to-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .customer-name {
            font-weight: bold;
            font-size: 13px;
            margin: 3px 0;
        }
        .customer-address {
            margin: 2px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: left;
            font-size: 12px;
        }
        .items-table th {
            background-color: #fff;
            font-weight: normal;
        }
        .gst-summary {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .gst-summary td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 12px;
        }
        .total-row {
            border-top: 1px solid #000;
            margin-top: 5px;
        }
        .total-row td {
            font-weight: bold;
        }
        .amount-in-words {
            border: 1px solid #000;
            padding: 5px;
            margin: 10px 0;
            font-size: 12px;
        }
        .footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 20px;
            border-top: 1px solid #000;
        }
        .declarations {
            padding: 5px;
            font-size: 11px;
        }
        .declarations ul {
            list-style-type: decimal;
            margin: 5px 0;
            padding-left: 20px;
        }
        .bank-details {
            border-left: 1px solid #000;
            padding: 5px;
            font-size: 11px;
        }
        .signatures {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 11px;
        }
        .bold-text {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="document-title">
            TAX INVOICE
            <span class="original-copy">Original for Recipient</span>
        </div>
        
        <div class="header-grid">
            <div class="company-info">
                <h1>ANBU PRINTING PRESS </h1>
                <p>Salem Main Road, Krisnagiri</p>
                <p>Kaveripattinam - 635112</p>
                <p>GSTIN/UIN: 33AHYPK5119K1ZV</p>
                <p>Contact: 9842932429</p>
                <p>E-Mail: thikathir@gmail.com</p>
                <p>MSME: ${invoice.msme || ''}</p>
            </div>
            <div class="invoice-meta">
                <table class="invoice-meta-table">
                    <tr>
                        <td>Invoice No<br>${invoice._id}</td>
                        <td>Date<br>${new Date(invoice.date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td>Terms of Payment<br>CREDIT BILL</td>
                        <td>Other Reference(s)</td>
                    </tr>
                    <tr>
                        <td>Buyer's Order No<br>${invoice.buyerOrderNo || ''}</td>
                        <td>Dated</td>
                    </tr>
                    <tr>
                        <td>Despatched Through<br>${invoice.transporterId || ''}</td>
                        <td>Destination<br>${invoice.customeraddress ? invoice.customeraddress.split(',').pop().trim() : 'ARACHALUR'}</td>
                    </tr>
                    <tr>
                        <td colspan="2" class="shipped-to">Shipped To:<br>${invoice.customername}<br>${invoice.customeraddress || ''}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="billed-to">
            <div class="billed-to-title">Billed To:</div>
            <p class="customer-name">${invoice.customername}</p>
            <p class="customer-address">${invoice.customeraddress || ''}</p>
            <p>GSTIN/UIN: ${invoice.customerGstin || ''}</p>
            <p>State Code: ${invoice.stateCode || ''}</p>
            <p>Place of Supply: ${invoice.placeOfSupply || 'TamilNadu'}</p>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Description</th>
                    <th>HSN Code</th>
                    <th>No of Cards<br></th>
                    <th>Quantity<br>Num</th>
                    <th>Rate</th>
                    <th>GST%</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.productname}</td>
                    <td>${item.hsnCode || ''}</td>
                    <td>${item.bags || ''}</td>
                    <td>${item.quantity} KGS</td>
                    <td>${item.unitprice.toFixed(2)}</td>
                    <td>${item.gstPercentage || 5}</td>
                    <td>${item.totalprice.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <table class="gst-summary">
            <tr>
                <td>Taxable Value<br><span class="bold-text">${invoice.subtotal.toFixed(2)}</span></td>
                <td>
                    CGST<br>
                    %: 2.5<br>
                    Amount: ${(invoice.totalgst / 2).toFixed(2)}
                </td>
                <td>
                    SGST<br>
                    %: 2.5<br>
                    Amount: ${(invoice.totalgst / 2).toFixed(2)}
                </td>
                <td>
                    Gross Amount<br>
                    SGST<br>
                    CGST
                </td>
                <td>
                    <span class="bold-text">${invoice.subtotal.toFixed(2)}</span><br>
                    ${(invoice.totalgst / 2).toFixed(2)}<br>
                    ${(invoice.totalgst / 2).toFixed(2)}
                </td>
            </tr>
            <tr class="total-row">
                <td colspan="4">Total</td>
                <td class="bold-text">${invoice.grandtotal.toFixed(2)}</td>
            </tr>
        </table>

        <div class="amount-in-words">
            Amount Chargeable (in words)<br>
            <strong>${invoice.amountInWords || 'Amount in words'}</strong>
            <span style="float: right;">E&OE</span>
        </div>

        <div class="footer">
            <div class="declarations">
                <strong>Declaration</strong>
                <ul>
                    <li>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</li>
                    <li>If payment is not received within 10 days 20% interest will be charged.</li>
                    <li>We are not responsible for any loss or damage caused during transit.</li>
                </ul>
            </div>
            <div class="bank-details">
                <strong>Company's Bank Details</strong>
                <p>Bank Name: Tamilnadu Mercantile Bank</p>
                <p>A/C No: 1200000207964</p>
                <p>Branch & IFSC Code: Kaveripattinam BRANCH & CNRB0001200</p>
            </div>
        </div>

        <div class="signatures">
            <div>Customer's Seal and Signature</div>
            <div>Prepared By</div>
            <div>Verified By</div>
            <div>For Anbu Printing Press<br>Authorised Signatory</div>
        </div>
    </div>
</body>
</html>
`;