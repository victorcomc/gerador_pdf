// frontend/src/App.jsx - COM O CAMPO 'WOODEN PACKAGE' COMO SELEÇÃO

import React, { useState } from 'react';
import './App.css';
import logo from './assets/logo.png';

// --- ESTADO INICIAL PARA MÚLTIPLOS CONTÊINERES ---
const initialContainer = {
  containerNo: '',
  sealArmador: '',
  sealShipper: '',
  containerTareWeight: '',
  packageCount: '',
  packType: '',
  grossWeight: '',
  measurementCBM: '',
};

const initialState = {
  shipperName: '', shipperInfo: '', consignee: '', notifyParty: '', notifyParty2: '', bookingNo: '', blNo: '', vessel: '', voyage: '', 
  portOfLoading: '', portOfDischarge: '', 
  marksAndNumber: '', cargoDescription: '', temperature: '', ncmCodes: '', 
  netWeight: '', exportReferences: '', ducNumber: '', rucNumber: '', 
  woodDeclaration: 'Treated / Certified',
  signedBlCount: '', blType: '', oblIssuedAt: '', freightType: '',
  // A lista de contêineres começa com um item por padrão
  containers: [{ ...initialContainer }],
};

function App() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [noSealShipper, setNoSealShipper] = useState(false);
  const [noBlCount, setNoBlCount] = useState(false);
  const [noMarks, setNoMarks] = useState(false);

  // --- FUNÇÕES PARA GERENCIAR MÚLTIPLOS CONTÊINERES ---
  const handleContainerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContainers = [...formData.containers];
    updatedContainers[index][name] = value;
    setFormData(prev => ({ ...prev, containers: updatedContainers }));
  };

  const addContainer = () => {
    setFormData(prev => ({
      ...prev,
      containers: [...prev.containers, { ...initialContainer }]
    }));
  };

  const removeContainer = (index) => {
    if (formData.containers.length <= 1) return;
    const updatedContainers = [...formData.containers];
    updatedContainers.splice(index, 1);
    setFormData(prev => ({ ...prev, containers: updatedContainers }));
  };

  const handleNoSealShipperChange = (e) => { const isChecked = e.target.checked; setNoSealShipper(isChecked); if (isChecked) setFormData(prev => ({ ...prev, sealShipper: '' })); };
  const handleNoBlCountChange = (e) => { const isChecked = e.target.checked; setNoBlCount(isChecked); if (isChecked) setFormData(prev => ({ ...prev, signedBlCount: '' })); };
  const handleNoMarksChange = (e) => { const isChecked = e.target.checked; setNoMarks(isChecked); if (isChecked) setFormData(prev => ({ ...prev, marksAndNumber: '' }));};
  const handleChange = (e) => { const { name, value, type } = e.target; if (type === 'radio' && formData[name] === value) { setFormData(prevState => ({ ...prevState, [name]: '' })); return; } setFormData(prevState => ({ ...prevState, [name]: value })); if (e.target.tagName === 'TEXTAREA') { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; } };
  
  const handleSubmit = async () => {
    // Validação dos campos principais (fora dos contêineres)
    const mainFields = [
        'shipperName', 'shipperInfo', 'consignee', 'notifyParty', 'bookingNo', 
        'vessel', 'voyage', 'portOfLoading', 'portOfDischarge', 
        'cargoDescription', 'ncmCodes', 'netWeight', 'exportReferences', 
        'ducNumber', 'rucNumber', 'woodDeclaration'
    ];
    for (const field of mainFields) {
        if (!formData[field]) {
            alert(`Por favor, preencha o campo obrigatório: ${field}`);
            return;
        }
    }
    // Validação dos campos de cada contêiner
    for (let i = 0; i < formData.containers.length; i++) {
        const container = formData.containers[i];
        for (const field in container) {
            if (!container[field] && !(field === 'sealShipper' && noSealShipper)) {
                alert(`Por favor, preencha todos os campos do Contêiner #${i + 1}`);
                return;
            }
        }
    }
    
    const isConfirmed = window.confirm("Tem certeza que deseja gerar o excel?");
    if (!isConfirmed) return;
    setIsLoading(true);
    let dataToSend = { ...formData };

    try {
      // ################### CORREÇÃO DEFINITIVA DA URL ###################
      // A URL agora inclui o endpoint correto /api/generate-file
      const backendUrl = 'https://gerador-excel-exportacao.onrender.com/api/generate-file';
      // ###############################################################

      const response = await fetch(backendUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(dataToSend), 
      });

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
      alert('Ocorreu um erro ao gerar o arquivo. Verifique os logs do backend para mais detalhes.');
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
        
        {/* --- SEÇÃO DINÂMICA DE CONTÊINERES --- */}
        <h2>3. Detalhes do Contêiner</h2>
        {formData.containers.map((container, index) => (
          <div key={index} className="container-group">
            <h3>Contêiner #{index + 1}</h3>
            <div className="form-group"><label>Container Nº<Required /></label><input type="text" name="containerNo" value={container.containerNo} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Lacre Armador<Required /></label><input type="text" name="sealArmador" value={container.sealArmador} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Lacre Shipper</label><input type="text" name="sealShipper" value={container.sealShipper} onChange={(e) => handleContainerChange(index, e)} disabled={noSealShipper} /><div className="checkbox-wrapper"><input type="checkbox" id={`noSealShipper-${index}`} checked={noSealShipper} onChange={handleNoSealShipperChange} /><label htmlFor={`noSealShipper-${index}`}>Sem lacre shipper</label></div></div>
            <div className="form-group"><label>Peso de Tara (Kgs)<Required /></label><input type="text" name="containerTareWeight" value={container.containerTareWeight} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Quantidade de Volumes (Neste Contêiner)<Required /></label><input type="text" name="packageCount" value={container.packageCount} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Tipo de Embalagem<Required /></label><input type="text" name="packType" value={container.packType} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Peso Bruto (Kgs)<Required /></label><input type="text" name="grossWeight" value={container.grossWeight} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label>Cubagem (CBM)<Required /></label><input type="text" name="measurementCBM" value={container.measurementCBM} onChange={(e) => handleContainerChange(index, e)} required /></div>
            {formData.containers.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeContainer(index)}>Remover Contêiner #{index + 1}</button>
            )}
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addContainer}>Adicionar Outro Contêiner</button>

        <h2>4. Detalhes da Carga</h2>
        <div className="form-group"><label htmlFor="marksAndNumber">Marcas e Números</label><input type="text" id="marksAndNumber" name="marksAndNumber" value={formData.marksAndNumber} onChange={handleChange} disabled={noMarks} /><div className="checkbox-wrapper"><input type="checkbox" id="noMarks" checked={noMarks} onChange={handleNoMarksChange} /><label htmlFor="noMarks">Sem marcas e números</label></div></div>
        <div className="form-group"><label htmlFor="cargoDescription">Descrição da Carga<Required /></label><textarea id="cargoDescription" name="cargoDescription" value={formData.cargoDescription} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="temperature">Temperatura (Opcional)</label><input type="text" id="temperature" name="temperature" value={formData.temperature} onChange={handleChange} /></div>
        <div className="form-group"><label htmlFor="ncmCodes">Códigos NCM (separados por vírgula)<Required /></label><textarea id="ncmCodes" name="ncmCodes" value={formData.ncmCodes} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="netWeight">Peso Líquido Total (Kgs)<Required /></label><input type="text" id="netWeight" name="netWeight" value={formData.netWeight} onChange={handleChange} required /></div>
        
        <h2>5. Documentação</h2>
        <div className="form-group"><label htmlFor="exportReferences">Referências de Exportação / Fatura<Required /></label><input type="text" id="exportReferences" name="exportReferences" value={formData.exportReferences} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="ducNumber">DU-E Nº<Required /></label><input type="text" id="ducNumber" name="ducNumber" value={formData.ducNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="rucNumber">RUC Nº<Required /></label><input type="text" id="rucNumber" name="rucNumber" value={formData.rucNumber} onChange={handleChange} required /></div>
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

