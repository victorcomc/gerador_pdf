// frontend/src/App.jsx - COM O CAMPO 'WOODEN PACKAGE' COMO SELEÇÃO

import React, { useState } from 'react';
// ... (o resto das suas importações e código inicial continua igual)
import './App.css';
import logo from './assets/logo.png';

const initialState = {
  shipperName: '', shipperInfo: '', consignee: '', notifyParty: '', notifyParty2: '', bookingNo: '', blNo: '', vessel: '', voyage: '', 
  portOfLoading: '', portOfDischarge: '', containerNo: '', sealArmador: '', sealShipper: '', containerTareWeight: '', 
  marksAndNumber: '', packageCount: '', packType: '', cargoDescription: '', temperature: '', ncmCodes: '', 
  grossWeight: '', netWeight: '', measurementCBM: '', exportReferences: '', ducNumber: '', rucNumber: '', 
  woodDeclaration: 'Treated / Certified', // Valor padrão
  signedBlCount: '', blType: '', oblIssuedAt: '', freightType: '',
};

function App() {
    // Todo o seu código de handlers (handleChange, handleSubmit, etc.) continua exatamente o mesmo.
    // A única mudança é no return, na seção 5. Documentação.
    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [noSealShipper, setNoSealShipper] = useState(false);
    const [noBlCount, setNoBlCount] = useState(false);
    const [noMarks, setNoMarks] = useState(false);
  
    const handleNoSealShipperChange = (e) => { const isChecked = e.target.checked; setNoSealShipper(isChecked); if (isChecked) setFormData(prev => ({ ...prev, sealShipper: '' })); };
    const handleNoBlCountChange = (e) => { const isChecked = e.target.checked; setNoBlCount(isChecked); if (isChecked) setFormData(prev => ({ ...prev, signedBlCount: '' })); };
    const handleNoMarksChange = (e) => { const isChecked = e.target.checked; setNoMarks(isChecked); if (isChecked) setFormData(prev => ({ ...prev, marksAndNumber: '' }));};
    const handleChange = (e) => { const { name, value, type } = e.target; if (type === 'radio' && formData[name] === value) { setFormData(prevState => ({ ...prevState, [name]: '' })); return; } setFormData(prevState => ({ ...prevState, [name]: value })); if (e.target.tagName === 'TEXTAREA') { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; } };
    const handleSubmit = async () => {
      const fieldsToValidate = Object.keys(initialState);
      const nonRequiredFields = ['blType', 'oblIssuedAt', 'freightType', 'notifyParty2', 'blNo', 'temperature'];
      for (const field of fieldsToValidate) {
        if (nonRequiredFields.includes(field)) continue;
        if (field === 'sealShipper' && noSealShipper) continue;
        if (field === 'signedBlCount' && noBlCount) continue;
        if (field === 'marksAndNumber' && noMarks) continue;
        if (!formData[field]) { alert("Por favor, preencha todos os campos obrigatórios (marcados com *)"); return; }
      }
      const isConfirmed = window.confirm("Tem certeza que deseja gerar o excel?");
      if (!isConfirmed) return;
      setIsLoading(true);
      let dataToSend = { ...formData };
      if (noSealShipper) dataToSend.sealShipper = '';
      if (noBlCount) dataToSend.signedBlCount = '';
      if (noMarks) dataToSend.marksAndNumber = '';
      try {
        const response = await fetch('http://127.0.0.1:5000/api/generate-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend), });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = `DRAFT HEVILE - ${formData.shipperName || 'documento'}.xlsx`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert("Arquivo Excel gerado com sucesso!");
        setFormData(initialState);
        setNoSealShipper(false);
        setNoBlCount(false);
        setNoMarks(false);
      } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        alert('Ocorreu um erro ao gerar o arquivo.');
      } finally {
        setIsLoading(false);
      }
    };
  
    const Required = () => <span className="required-asterisk">*</span>;

  return (
    <div className="form-container">
      <img src={logo} alt="Logo Hevile" className="logo" />
      <h1>DRAFT HEVILE</h1>
      <form>
        <h2>1. Partes Envolvidas</h2>
        <div className="form-group"><label htmlFor="shipperName">Nome da Empresa (Shipper)<Required /></label><input type="text" id="shipperName" name="shipperName" value={formData.shipperName} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="shipperInfo">Endereço e Informações Adicionais (Shipper)<Required /></label><textarea id="shipperInfo" name="shipperInfo" value={formData.shipperInfo} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="consignee">Consignee / Importador<Required /></label><textarea id="consignee" name="consignee" value={formData.consignee} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="notifyParty">Notify 1<Required /></label><textarea id="notifyParty" name="notifyParty" value={formData.notifyParty} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="notifyParty2">Notify 2 (Opcional)</label><textarea id="notifyParty2" name="notifyParty2" value={formData.notifyParty2} onChange={handleChange}></textarea></div>
        
        <h2>2. Detalhes da Viagem</h2>
        <div className="form-group"><label htmlFor="bookingNo">Booking Nº<Required /></label><input type="text" id="bookingNo" name="bookingNo" value={formData.bookingNo} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="blNo">B/L Nº (Opcional)</label><input type="text" id="blNo" name="blNo" value={formData.blNo} onChange={handleChange} /></div>
        <div className="form-group"><label htmlFor="vessel">Navio (Vessel)<Required /></label><input type="text" id="vessel" name="vessel" value={formData.vessel} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="voyage">Viagem (Voyage)<Required /></label><input type="text" id="voyage" name="voyage" value={formData.voyage} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="portOfLoading">Porto de Embarque<Required /></label><input type="text" id="portOfLoading" name="portOfLoading" value={formData.portOfLoading} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="portOfDischarge">Porto de Desembarque<Required /></label><input type="text" id="portOfDischarge" name="portOfDischarge" value={formData.portOfDischarge} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="blType">BL</label><select id="blType" name="blType" value={formData.blType} onChange={handleChange}><option value="">Nenhuma</option><option value="EXPRESS RELEASE">EXPRESS RELEASE</option><option value="TELEX RELEASE">TELEX RELEASE</option><option value="WAYBILL">WAYBILL (NO OBL REQUIRED)</option></select></div>
        <div className="form-group"><label htmlFor="oblIssuedAt">OBL ISSUED AT</label><select id="oblIssuedAt" name="oblIssuedAt" value={formData.oblIssuedAt} onChange={handleChange}><option value="">Nenhuma</option><option value="ORIGIN">ORIGIN</option><option value="DESTINATION">DESTINATION</option></select></div>
        <div className="form-group"><label htmlFor="freightType">FREIGHT</label><select id="freightType" name="freightType" value={formData.freightType} onChange={handleChange}><option value="">Nenhuma</option><option value="PREPAID">PREPAID</option><option value="PREPAID ABROAD">PREPAID ABROAD</option><option value="COLLECT">COLLECT</option></select></div>
        
        <h2>3. Detalhes do Contêiner</h2>
        <div className="form-group"><label htmlFor="containerNo">Container Nº<Required /></label><input type="text" id="containerNo" name="containerNo" value={formData.containerNo} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="sealArmador">Lacre Armador<Required /></label><input type="text" id="sealArmador" name="sealArmador" value={formData.sealArmador} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="sealShipper">Lacre Shipper</label><input type="text" id="sealShipper" name="sealShipper" value={formData.sealShipper} onChange={handleChange} disabled={noSealShipper} /><div className="checkbox-wrapper"><input type="checkbox" id="noSealShipper" checked={noSealShipper} onChange={handleNoSealShipperChange} /><label htmlFor="noSealShipper">Sem lacre shipper</label></div></div>
        <div className="form-group"><label htmlFor="containerTareWeight">Peso de Tara do Contêiner (Kgs)<Required /></label><input type="text" id="containerTareWeight" name="containerTareWeight" value={formData.containerTareWeight} onChange={handleChange} required /></div>
        
        <h2>4. Detalhes da Carga</h2>
        <div className="form-group"><label htmlFor="marksAndNumber">Marcas e Números</label><input type="text" id="marksAndNumber" name="marksAndNumber" value={formData.marksAndNumber} onChange={handleChange} disabled={noMarks} /><div className="checkbox-wrapper"><input type="checkbox" id="noMarks" checked={noMarks} onChange={handleNoMarksChange} /><label htmlFor="noMarks">Sem marcas e números</label></div></div>
        <div className="form-group"><label htmlFor="packageCount">Quantidade de Volumes<Required /></label><input type="text" id="packageCount" name="packageCount" value={formData.packageCount} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="packType">Tipo de Embalagem (Ex: PAILS)<Required /></label><input type="text" id="packType" name="packType" value={formData.packType} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="cargoDescription">Descrição da Carga<Required /></label><textarea id="cargoDescription" name="cargoDescription" value={formData.cargoDescription} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="temperature">Temperatura (Opcional)</label><input type="text" id="temperature" name="temperature" value={formData.temperature} onChange={handleChange} /></div>
        <div className="form-group"><label htmlFor="ncmCodes">Códigos NCM (separados por vírgula)<Required /></label><textarea id="ncmCodes" name="ncmCodes" value={formData.ncmCodes} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="grossWeight">Peso Bruto (Kgs)<Required /></label><input type="text" id="grossWeight" name="grossWeight" value={formData.grossWeight} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="netWeight">Peso Líquido (Kgs)<Required /></label><input type="text" id="netWeight" name="netWeight" value={formData.netWeight} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="measurementCBM">Cubagem (CBM)<Required /></label><input type="text" id="measurementCBM" name="measurementCBM" value={formData.measurementCBM} onChange={handleChange} required /></div>
        
        <h2>5. Documentação</h2>
        <div className="form-group"><label htmlFor="exportReferences">Referências de Exportação / Fatura<Required /></label><input type="text" id="exportReferences" name="exportReferences" value={formData.exportReferences} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="ducNumber">DU-E Nº<Required /></label><input type="text" id="ducNumber" name="ducNumber" value={formData.ducNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="rucNumber">RUC Nº<Required /></label><input type="text" id="rucNumber" name="rucNumber" value={formData.rucNumber} onChange={handleChange} required /></div>
        {/* ===== MUDANÇA AQUI ===== */}
        <div className="form-group">
            <label htmlFor="woodDeclaration">Declaração de Madeira<Required /></label>
            <select id="woodDeclaration" name="woodDeclaration" value={formData.woodDeclaration} onChange={handleChange}>
                <option value="Treated / Certified">Treated / Certified</option>
                <option value="Not Applicable">Not Applicable</option>
                <option value="Processed">Processed</option>
                <option value="Not Treated / Not Certified">Not Treated / Not Certified</option>
            </select>
        </div>
        <div className="form-group"><label htmlFor="signedBlCount">Número de B/Ls Originais</label><input type="text" id="signedBlCount" name="signedBlCount" value={formData.signedBlCount} onChange={handleChange} disabled={noBlCount} /><div className="checkbox-wrapper"><input type="checkbox" id="noBlCount" checked={noBlCount} onChange={handleNoBlCountChange} /><label htmlFor="noBlCount">Sem número de BL</label></div></div>
        
        <button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Gerando Arquivo...' : 'Gerar Excel'}
        </button>
      </form>
    </div>
  );
}

export default App;