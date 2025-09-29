# backend/app.py

from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
from weasyprint import HTML

app = Flask(__name__)
CORS(app)

@app.route('/api/generate-pdf', methods=['POST'])
def handle_form():
    if not request.json:
        return jsonify({"error": "Missing JSON"}), 400

    data = request.json
    
    html_string = render_template(
        'si_template.html', 
        # Mapeando cada campo do JSON para uma variável no template
        shipper=data.get('shipper'),
        consignee=data.get('consignee'),
        notify_party=data.get('notifyParty'),
        booking_no=data.get('bookingNo'),
        vessel=data.get('vessel'),
        voyage=data.get('voyage'),
        port_of_loading=data.get('portOfLoading'),
        port_of_discharge=data.get('portOfDischarge'),
        container_no=data.get('containerNo'),
        seal_no=data.get('sealNo'),
        container_tare_weight=data.get('containerTareWeight'),
        marks_and_number=data.get('marksAndNumber'),
        package_count=data.get('packageCount'),
        cargo_description=data.get('cargoDescription'),
        ncm_codes=data.get('ncmCodes'),
        gross_weight=data.get('grossWeight'),
        net_weight=data.get('netWeight'),
        measurement_cbm=data.get('measurementCBM'),
        export_references=data.get('exportReferences'),
        duc_number=data.get('ducNumber'),
        ruc_number=data.get('rucNumber'),
        wood_declaration=data.get('woodDeclaration'),
        signed_bl_count=data.get('signedBlCount')
    )

    pdf_bytes = HTML(string=html_string, base_url=request.base_url).write_pdf()
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=shipping_instruction.pdf'
    
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)