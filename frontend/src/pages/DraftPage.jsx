// frontend/src/pages/DraftPage.jsx (Múltiplos Contêineres + Autenticação)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DraftPage.css'; // Assume que você criará este CSS
import logo from '../assets/logo.png';

// Estrutura de um único contêiner
const initialContainerState = {
  containerNo: '',
  sealArmador: '',
  sealShipper: '',
  containerTareWeight: '',
  packageCount: '',
  packType: '',
  grossWeight: '',
  measurementCBM: ''
};

// Estado inicial do formulário (sem os campos de contêiner)
const initialFormState = {
  shipperName: '', shipperInfo: '', consignee: '', notifyParty: '', notifyParty2: '', bookingNo: '', blNo: '', vessel: '', voyage: '', 
  portOfLoading: '', portOfDischarge: '', 
  marksAndNumber: '', cargoDescription: '', temperature: '', ncmCodes: '', 
  netWeight: '', exportReferences: '', ducNumber: '', rucNumber: '', 
  woodDeclaration: 'Treated / Certified',
  signedBlCount: '', blType: '', oblIssuedAt: '', freightType: '',
  containers: [{ ...initialContainerState }] // Começa com um contêiner
};

function DraftPage() {
  const [formData, setFormData] = useState(initialFormState);
  // Estado separado para os dados pré-preenchidos
  const [clientData, setClientData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [noSealShipper, setNoSealShipper] = useState(false);
  const [noBlCount, setNoBlCount] = useState(false);
  const [noMarks, setNoMarks] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://gerador-excel-exportacao.onrender.com"; 

  // Busca os dados pré-preenchidos do cliente ao carregar
  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/get-client-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Falha na autenticação');

        const data = await response.json();
        // Armazena os dados do cliente em um estado separado
        setClientData(data);
        // Preenche o formulário com os dados do cliente
        setFormData(prev => ({ ...prev, ...data }));

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    };
    fetchClientData();
  }, [navigate]);
  
  // --- Handlers de Checkbox ---
  const handleNoSealShipperChange = (e) => { const isChecked = e.target.checked; setNoSealShipper(isChecked); };
  const handleNoBlCountChange = (e) => { const isChecked = e.target.checked; setNoBlCount(isChecked); if (isChecked) setFormData(prev => ({ ...prev, signedBlCount: '' })); };
  const handleNoMarksChange = (e) => { const isChecked = e.target.checked; setNoMarks(isChecked); if (isChecked) setFormData(prev => ({ ...prev, marksAndNumber: '' }));};

  // --- Handler Geral para campos do formulário ---
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'radio' && formData[name] === value) {
      setFormData(prevState => ({ ...prevState, [name]: '' }));
      return;
    }
    setFormData(prevState => ({ ...prevState, [name]: value }));
    if (e.target.tagName === 'TEXTAREA') {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  // --- Handlers para Múltiplos Contêineres ---
  const handleContainerChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContainers = [...formData.containers];
    updatedContainers[index][name] = value;
    setFormData(prev => ({ ...prev, containers: updatedContainers }));
  };

  const addContainer = () => {
    if (formData.containers.length < 20) {
      setFormData(prev => ({
        ...prev,
        containers: [...prev.containers, { ...initialContainerState }]
      }));
    } else {
      alert("Você atingiu o limite máximo de 20 contêineres.");
    }
  };

  const removeContainer = (index) => {
    if (formData.containers.length <= 1) return; // Não remove o último
    const updatedContainers = [...formData.containers];
    updatedContainers.splice(index, 1);
    setFormData(prev => ({ ...prev, containers: updatedContainers }));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const handleSubmit = async () => {
    // Validação dos campos principais
    const mainFields = ['shipperName', 'shipperInfo', 'consignee', 'notifyParty', 'bookingNo', 'vessel', 'voyage', 'portOfLoading', 'portOfDischarge', 'cargoDescription', 'ncmCodes', 'netWeight', 'exportReferences', 'ducNumber', 'rucNumber', 'woodDeclaration'];
    for (const field of mainFields) {
      if (!formData[field]) {
        alert(`Por favor, preencha o campo obrigatório: ${field}`);
        return;
      }
    }
    // Validação dos checkboxes
    if (!noMarks && !formData.marksAndNumber) {
        alert("Por favor, preencha Marcas e Números ou marque a opção 'Sem marcas'.");
        return;
    }
    if (!noBlCount && !formData.signedBlCount) {
        alert("Por favor, preencha Número de B/Ls ou marque a opção 'Sem número'.");
        return;
    }
    // Validação dos campos de cada contêiner
    for (let i = 0; i < formData.containers.length; i++) {
        const container = formData.containers[i];
        const requiredContainerFields = ['containerNo', 'sealArmador', 'containerTareWeight', 'packageCount', 'packType', 'grossWeight', 'measurementCBM'];
        
        for (const field of requiredContainerFields) {
            if (!container[field]) {
                alert(`Por favor, preencha todos os campos do Contêiner #${i + 1} (campo '${field}' está faltando).`);
                return;
            }
        }
        // Validação do Lacre Shipper (só é obrigatório se a caixa não estiver marcada)
        if (!container.sealShipper && !noSealShipper) {
            alert(`Por favor, preencha o Lacre Shipper do Contêiner #${i + 1} ou marque 'Sem lacre shipper'.`);
            return;
        }
    }

    const isConfirmed = window.confirm("Tem certeza que deseja gerar o excel?");
    if (!isConfirmed) return;
    setIsLoading(true);

    let dataToSend = { ...formData };
    // Limpa campos opcionais se as caixas estiverem marcadas
    if (noBlCount) dataToSend.signedBlCount = '';
    if (noMarks) dataToSend.marksAndNumber = '';
    // Ajusta o lacre shipper em cada contêiner se a caixa estiver marcada
    if (noSealShipper) {
        dataToSend.containers = dataToSend.containers.map(c => ({...c, sealShipper: ''}));
    }

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_URL}/api/generate-file`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envia o token
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
      if (!response.ok) throw new Error('Erro ao gerar o arquivo');
      
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

      // Reseta o formulário, mas mantém os dados pré-preenchidos do cliente
      setFormData({ ...initialFormState, ...clientData, containers: [{...initialContainerState}] });
      setNoSealShipper(false);
      setNoBlCount(false);
      setNoMarks(false);

    } catch (error) {
      console.error("Erro ao gerar o arquivo:", error);
      alert(error.message || 'Ocorreu um erro.');
      if (error.message.includes('Sessão expirada')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Required = () => <span className="required-asterisk">*</span>;

  return (
    <div className="form-container">
      <img src={logo} alt="Logo Hevile" className="logo" />
      <h1>DRAFT HEVILE</h1>
      
      <button onClick={handleLogout} className="logout-button">Sair</button>

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
        
        {/* --- SEÇÃO DE MÚLTIPLOS CONTÊINERES (JÁ FUNCIONAL) --- */}
        <h2>3. Detalhes do(s) Contêiner(es)</h2>
        <div className="checkbox-wrapper"><input type="checkbox" id="noSealShipper" checked={noSealShipper} onChange={handleNoSealShipperChange} /><label htmlFor="noSealShipper">Sem lacre shipper para TODOS os contêineres</label></div>

        {formData.containers.map((container, index) => (
          <div key={index} className="container-block"> {/* (Estilize .container-block no CSS) */}
            <div className="container-header">
              <h4>Contêiner {index + 1}</h4>
              {formData.containers.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeContainer(index)}>Remover</button>
              )}
            </div>
            <div className="form-group"><label htmlFor={`containerNo-${index}`}>Container Nº<Required /></label><input type="text" id={`containerNo-${index}`} name="containerNo" value={container.containerNo} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`sealArmador-${index}`}>Lacre Armador<Required /></label><input type="text" id={`sealArmador-${index}`} name="sealArmador" value={container.sealArmador} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`sealShipper-${index}`}>Lacre Shipper</label><input type="text" id={`sealShipper-${index}`} name="sealShipper" value={container.sealShipper} onChange={(e) => handleContainerChange(index, e)} disabled={noSealShipper} required={!noSealShipper} /></div>
            <div className="form-group"><label htmlFor={`containerTareWeight-${index}`}>Peso de Tara (Kgs)<Required /></label><input type="text" id={`containerTareWeight-${index}`} name="containerTareWeight" value={container.containerTareWeight} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`packageCount-${index}`}>Qtd. Volumes (neste cont.)<Required /></label><input type="text" id={`packageCount-${index}`} name="packageCount" value={container.packageCount} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`packType-${index}`}>Tipo Embalagem<Required /></label><input type="text" id={`packType-${index}`} name="packType" value={container.packType} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`grossWeight-${index}`}>Peso Bruto (Kgs)<Required /></label><input type="text" id={`grossWeight-${index}`} name="grossWeight" value={container.grossWeight} onChange={(e) => handleContainerChange(index, e)} required /></div>
            <div className="form-group"><label htmlFor={`measurementCBM-${index}`}>Cubagem (CBM)<Required /></label><input type="text" id={`measurementCBM-${index}`} name="measurementCBM" value={container.measurementCBM} onChange={(e) => handleContainerChange(index, e)} required /></div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addContainer}>Adicionar Contêiner</button>
        {/* --- FIM DA SEÇÃO DE MÚLTIPLOS CONTÊINERES --- */}
        
        <h2>4. Detalhes da Carga (Gerais)</h2>
        <div className="form-group"><label htmlFor="marksAndNumber">Marcas e Números</label><input type="text" id="marksAndNumber" name="marksAndNumber" value={formData.marksAndNumber} onChange={handleChange} disabled={noMarks} /><div className="checkbox-wrapper"><input type="checkbox" id="noMarks" checked={noMarks} onChange={handleNoMarksChange} /><label htmlFor="noMarks">Sem marcas e números</label></div></div>
        <div className="form-group"><label htmlFor="cargoDescription">Descrição da Carga<Required /></label><textarea id="cargoDescription" name="cargoDescription" value={formData.cargoDescription} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="temperature">Temperatura (Opcional)</label><input type="text" id="temperature" name="temperature" value={formData.temperature} onChange={handleChange} /></div>
        <div className="form-group"><label htmlFor="ncmCodes">Códigos NCM (separados por vírgula)<Required /></label><textarea id="ncmCodes" name="ncmCodes" value={formData.ncmCodes} onChange={handleChange} required></textarea></div>
        <div className="form-group"><label htmlFor="netWeight">Peso Líquido Total (Kgs)<Required /></label><input type="text" id="netWeight" name="netWeight" value={formData.netWeight} onChange={handleChange} required /></div>
        
        <h2>5. Documentação</h2>
        <div className="form-group"><label htmlFor="exportReferences">Referências de Exportação / Fatura<Required /></label><input type="text" id="exportReferences" name="exportReferences" value={formData.exportReferences} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="ducNumber">DU-E Nº<Required /></label><input type="text" id="ducNumber" name="ducNumber" value={formData.ducNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="rucNumber">RUC Nº<Required /></label><input type="text" id="rucNumber" name="rucNumber" value={formData.rucNumber} onChange={handleChange} required /></div>
        <div className="form-group"><label htmlFor="woodDeclaration">Declaração de Madeira<Required /></label><select id="woodDeclaration" name="woodDeclaration" value={formData.woodDeclaration} onChange={handleChange}><option value="Treated / Certified">Treated / Certified</option><option value="Not Applicable">Not Applicable</option><option value="Processed">Processed</option><option value="Not Treated / Not Certified">Not Treated / Not Certified</option></select></div>
        <div className="form-group"><label htmlFor="signedBlCount">Número de B/Ls Originais</label><input type="text" id="signedBlCount" name="signedBlCount" value={formData.signedBlCount} onChange={handleChange} disabled={noBlCount} /><div className="checkbox-wrapper"><input type="checkbox" id="noBlCount" checked={noBlCount} onChange={handleNoBlCountChange} /><label htmlFor="noBlCount">Sem número de BL</label></div></div>
        
        <button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Gerando Arquivo...' : 'Gerar Excel'}
        </button>
      </form>
    </div>
  );
}

export default DraftPage;
