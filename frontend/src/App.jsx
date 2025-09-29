// frontend/src/App.jsx - NOVA ABORDAGEM COM onClick

import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    shipper: '', consignee: '', notifyParty: '', bookingNo: '', vessel: '', voyage: '',
    portOfLoading: '', portOfDischarge: '', containerNo: '', sealNo: '', containerTareWeight: '',
    marksAndNumber: 'NO MARKS', packageCount: '', cargoDescription: '', ncmCodes: '',
    grossWeight: '', netWeight: '', measurementCBM: '', exportReferences: '',
    ducNumber: '', rucNumber: '', woodDeclaration: 'TREATED AND CERTIFIED', signedBlCount: '03 (THREE)',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };
  
  // MUDANÇA 1: A função não recebe mais o evento 'e'
  const handleSubmit = async () => {
    // A linha e.preventDefault() foi removida
    setIsLoading(true);
    try {
      console.log("Enviando dados via onClick:", formData); // Adicionando um log para ter certeza
      const response = await fetch('http://127.0.0.1:5000/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shipping_instruction.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      alert('Ocorreu um erro ao gerar o PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Preenchimento de Shipping Instruction</h1>
      {/* MUDANÇA 2: O onSubmit foi removido do <form> */}
      <form> 
        {/* Todos os seus campos de input continuam aqui normalmente... */}
        <h2>1. Partes Envolvidas</h2>
        <div className="form-group"><label htmlFor="shipper">Shipper / Exportador</label><textarea id="shipper" name="shipper" value={formData.shipper} onChange={handleChange} required rows="3"></textarea></div>
        <div className="form-group"><label htmlFor="consignee">Consignee / Importador</label><textarea id="consignee" name="consignee" value={formData.consignee} onChange={handleChange} required rows="3"></textarea></div>
        <div className="form-group"><label htmlFor="notifyParty">Notify Party / A ser notificado</label><textarea id="notifyParty" name="notifyParty" value={formData.notifyParty} onChange={handleChange} required rows="3"></textarea></div>
        <h2>2. Detalhes da Viagem</h2>
        <div className="form-group"><label htmlFor="bookingNo">Booking Nº</label><input type="text" id="bookingNo" name="bookingNo" value={formData.bookingNo} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="vessel">Navio (Vessel)</label><input type="text" id="vessel" name="vessel" value={formData.vessel} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="voyage">Viagem (Voyage)</label><input type="text" id="voyage" name="voyage" value={formData.voyage} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="portOfLoading">Porto de Embarque</label><input type="text" id="portOfLoading" name="portOfLoading" value={formData.portOfLoading} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="portOfDischarge">Porto de Desembarque</label><input type="text" id="portOfDischarge" name="portOfDischarge" value={formData.portOfDischarge} onChange={handleChange} required /></div>
        <h2>3. Detalhes do Contêiner</h2>
        <div className="form-group"><label htmlFor="containerNo">Container Nº</label><input type="text" id="containerNo" name="containerNo" value={formData.containerNo} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="sealNo">Lacre Nº (Seal)</label><input type="text" id="sealNo" name="sealNo" value={formData.sealNo} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="containerTareWeight">Peso de Tara do Contêiner (Kgs)</label><input type="text" id="containerTareWeight" name="containerTareWeight" value={formData.containerTareWeight} onChange={handleChange} required /></div>
        <h2>4. Detalhes da Carga</h2>
        <div className="form-group"><label htmlFor="marksAndNumber">Marcas e Números</label><input type="text" id="marksAndNumber" name="marksAndNumber" value={formData.marksAndNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="packageCount">Quantidade de Volumes</label><input type="text" id="packageCount" name="packageCount" value={formData.packageCount} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="cargoDescription">Descrição da Carga</label><textarea id="cargoDescription" name="cargoDescription" value={formData.cargoDescription} onChange={handleChange} required rows="5"></textarea></div>
        <div className="form-group"><label htmlFor="ncmCodes">Códigos NCM (separados por vírgula)</label><textarea id="ncmCodes" name="ncmCodes" value={formData.ncmCodes} onChange={handleChange} required rows="3"></textarea></div>
        <div className="form-group"><label htmlFor="grossWeight">Peso Bruto (Kgs)</label><input type="text" id="grossWeight" name="grossWeight" value={formData.grossWeight} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="netWeight">Peso Líquido (Kgs)</label><input type="text" id="netWeight" name="netWeight" value={formData.netWeight} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="measurementCBM">Cubagem (CBM)</label><input type="text" id="measurementCBM" name="measurementCBM" value={formData.measurementCBM} onChange={handleChange} required /></div>
        <h2>5. Documentação</h2>
        <div className="form-group"><label htmlFor="exportReferences">Referências de Exportação / Fatura</label><input type="text" id="exportReferences" name="exportReferences" value={formData.exportReferences} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="ducNumber">DU-E Nº</label><input type="text" id="ducNumber" name="ducNumber" value={formData.ducNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="rucNumber">RUC Nº</label><input type="text" id="rucNumber" name="rucNumber" value={formData.rucNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="woodDeclaration">Declaração de Madeira</label><input type="text" id="woodDeclaration" name="woodDeclaration" value={formData.woodDeclaration} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="signedBlCount">Número de B/Ls Originais</label><input type="text" id="signedBlCount" name="signedBlCount" value={formData.signedBlCount} onChange={handleChange} required /></div>

        {/* MUDANÇA 3: O botão agora é type="button" e tem um onClick */}
        <button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>
      </form>
    </div>
  );
}

export default App;