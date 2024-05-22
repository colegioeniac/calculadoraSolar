import inversores from './inversor.js';
import PainelSolar from './solarPainel.js';
import OpenMeteo from './mediaIrradianciaMensal.js';

const painel270w = new PainelSolar("Canadian Risen 270w", 270, 38.2, 31.2, 8.67, 9.2, -0.33, -0.39, 0.033, 45, 1.64, 0.99, 1.63, 1.79);
const painel500w = new PainelSolar("Canadian Risen 500w",500, 51.23, 42.88, 11.74, 12.53, -0.28, -0.36, 0.05, 44, 2.22, 1.10, 2.40, 2.4);

const painel330w = new PainelSolar("Canadian Risen 330w", 330, 46.3, 38.1, 8.7, 9.25, -0.32, -0.40, 0.034, 45, 1.96, 0.99, 1.94, 2.13);
const painel325w = new PainelSolar("Canadian Risen 325w", 325, 45.5, 37, 8.78, 9.34, -0.31, -0.41, 0.053, 45, 1.96, 0.99, 1.94, 2.13);
const paineis = [painel270w, painel330w, painel325w,painel500w];
const painel = paineis[3]

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll(".pergunta-frequente").forEach(pergunta => {
        pergunta.addEventListener("click", () => {
            let resposta = pergunta.nextElementSibling;
            if (resposta && resposta.classList.contains("resposta")) { 
                if (resposta.style.display === "none" || resposta.style.display === "") {
                    resposta.style.display = "block";
                } else {
                    resposta.style.display = "none";
                }
                pergunta.classList.toggle("aberta");
            } else {
                console.error("Elemento resposta não encontrado.");
            }
        });
    });

    async function calcular(formId) {
        const openMeteo = new OpenMeteo(-23.4628, -46.5333);

        await openMeteo.addMedia();

        const mediaIrradiacaoAnual = OpenMeteo.meses.reduce((total, mes) => {
            if (mes.mediaIrradiacao) {
                return total + mes.mediaIrradiacao;
            } else {
                return total;
            }
        }, 0) / 12;

        const mediaTemperaturaAnual = OpenMeteo.meses.reduce((total, mes) => {
            if (mes.mediaTemperatura) {
                return total + mes.mediaTemperatura;
            } else {
                return total;
            }
        }, 0) / 12;

        const consumoMedioMensal = parseFloat(document.getElementById(`consumoMedioMensal-${formId}`).value);
        const custoPorKWH = parseFloat(document.getElementById(`custo-kwh-${formId}`).value);
        const cidade = document.getElementById(`localizacao-${formId}`).value;
   
        let irradiacaoSolarMediaDiaria = 0
        await fetch('radiacaoMedia.json')
        .then(response => {
            if (!response.ok) {
              throw new Error('Erro ao carregar o arquivo');
            }
            return response.json();
          })
        .then(data => {
            console.log(data)
            if (data[cidade]) {
                
                irradiacaoSolarMediaDiaria = data[cidade].mediaIrradiacaoSolar;
                mediaTemperaturaAnual = data[cidade].mediaTemperaturaAnual;
              } else {
               
                document.getElementById("resultado").innerHTML = "Cidade não encontrada";
              }
        })
        .catch(error => console.error('Erro ao carregar dados:', error));
        
    
        const rendimentoInversor = inversores.inversor4.getEficiencia();
        const potCorrigida = painel.calcularPotenciaCorrigida(18.8);
        const potSaidaInversor = painel.calculaPotSaidaInversor(potCorrigida, rendimentoInversor, 1);
        const energiaGerada = painel.calculoEnergiaGeradaMensal(30,mediaIrradiacaoAnual/ 1000, 0.98, Number(potSaidaInversor));

        const qtd = Math.ceil(consumoMedioMensal / energiaGerada);
        const potSistema = Number(((qtd * painel.potPico)/1000).toFixed(2));

        let energiaGeradaMes = [];
        let mediaIrradiacao = [];
        let mediaTemp = [];
        let meses = [];
        
        for (let i = 0; i < OpenMeteo.meses.length; i++) {

            const mes = OpenMeteo.meses[i];
            
            mediaIrradiacao.push(Math.round(mes.mediaIrradiacao !== undefined ? mes.mediaIrradiacao : 0));
            mediaTemp.push(mes.mediaTemperatura !== undefined ? mes.mediaTemperatura : 0);
            meses.push(mes.nome);
            const potCorrigida = painel.calcularPotenciaCorrigida(mes.mediaTemperatura !== undefined ? mes.mediaTemperatura : 0);
            const potSaidaInversor = painel.calculaPotSaidaInversor(potCorrigida, rendimentoInversor, qtd);

            const energiaGerada = painel.calculoEnergiaGeradaMensal(mes.dias, (mes.mediaIrradiacao !== undefined ? mes.mediaIrradiacao : 0) / 1000, 0.98, potSaidaInversor);
            energiaGeradaMes.push(Math.round(energiaGerada)); 
        }

        let energiaGeradaArray = { meses: meses, dados: energiaGeradaMes };
        mediaIrradiacao = { meses: meses, dados: mediaIrradiacao };
        mediaTemp = { meses: meses, dados: mediaTemp };
        const energiaTotal = energiaGeradaArray.dados.reduce((total, mes) => total + mes, 0);
      
        const investimentoMedio = (qtd * 2000)

        const valorkWhTotal = consumoMedioMensal * custoPorKWH
        const payback = investimentoMedio / (valorkWhTotal + 20)
      
        const TONco2 = Number(((energiaTotal * 0.295)/1000).toFixed(1));
        const arvores = Math.round((TONco2) * 7.14451202);

        const areaInstalacao = Number((qtd * painel.areaInstalacao).toFixed(1));
        
        const energiaGeradaMesEstimada = Number(energiaTotal / 12).toFixed(0)
        localStorage.setItem("potenciaSistema", potSistema + " kWp");
        localStorage.setItem("quantidadePlacas", qtd);
        localStorage.setItem("payback", payback.toFixed(1) + " Meses");
        localStorage.setItem("investimentoMedio", investimentoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        localStorage.setItem("reducaoCO2", TONco2 + " Ton");
        localStorage.setItem("areaInstalacao", areaInstalacao + " m²");
        localStorage.setItem("arvores", arvores);
        localStorage.setItem("energiaGerada", energiaGeradaMesEstimada + " kWh/mês");

        window.location.href = "resultado.html";
    }

    document.getElementById('botao-desktop').addEventListener('click', () => {
        calcular('desktop');
    });

    document.getElementById('botao-mobile').addEventListener('click', () => {
        calcular('mobile');
    });
});
