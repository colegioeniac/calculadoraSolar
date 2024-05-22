class PainelSolar {
    constructor(
        modelo,
        potPico,
        voc,
        vmpp,
        correnteNominal,
        isc,
        tempVoc,
        tempPmax,
        tempIsc,
        noct,
        comprimento,
        largura,
        area,
        areaInstalacao
    ) {
        this.modelo = modelo;
        this.potPico = potPico;
        this.voc = voc;
        this.vmpp = vmpp;
        this.correnteNominal = correnteNominal;
        this.isc = isc;
        this.tempVoc = tempVoc;
        this.tempPmax = tempPmax;
        this.tempIsc = tempIsc;
        this.noct = noct;
        this.comprimento = comprimento;
        this.largura = largura;
        this.area = area;
        this.areaInstalacao = areaInstalacao;
    }
    
    calcularPotenciaCorrigida(temperatura, perdasDC) {
        if (perdasDC) {
            perdasDC = perdasDC >= 0 && perdasDC <= 1 ? perdasDC : 0.10;
        } else {
            perdasDC = 0.10;
        }
        const perdas = perdasDC;
        const radiacaoSolar = 1000;
        const tempCelula = temperatura + radiacaoSolar * ((this.noct - 20) / 800 * 0.9);
        const potCorrigida = this.potPico * (1 - (this.tempPmax / 100 * (-1)) * (tempCelula - 25));
        return parseFloat((potCorrigida * (1 - perdas)).toFixed(3));
    }

    calculaPotSaidaInversor(potCorrigida, rendimentoInversor, qtdPaineis) {
        const potRendimentoInversor = +(potCorrigida * (rendimentoInversor / 100)).toFixed(3);
        const potTotal = qtdPaineis * potRendimentoInversor / 1000;
        return potTotal;
    }

    calculoEnergiaGeradaMensal(diasMes, irradiacaoSolar, fatorDeCorrecao, potenciaTotalSistema) {
        const f = fatorDeCorrecao || 0.98;
        return +(diasMes * irradiacaoSolar * f * (potenciaTotalSistema || 0)).toFixed(3);
    }
}

export default PainelSolar;

