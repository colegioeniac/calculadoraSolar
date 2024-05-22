class OpenMeteo {
    static meses = [
      { numero: 1, nome: "Janeiro", dias: 31 },
      { numero: 2, nome: "Fevereiro", dias: 28 },
      { numero: 3, nome: "Março", dias: 31 },
      { numero: 4, nome: "Abril", dias: 30 },
      { numero: 5, nome: "Maio", dias: 31 },
      { numero: 6, nome: "Junho", dias: 30 },
      { numero: 7, nome: "Julho", dias: 31 },
      { numero: 8, nome: "Agosto", dias: 31 },
      { numero: 9, nome: "Setembro", dias: 30 },
      { numero: 10, nome: "Outubro", dias: 31 },
      { numero: 11, nome: "Novembro", dias: 30 },
      { numero: 12, nome: "Dezembro", dias: 31 },
    ];
  
    constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  
    async getClimate(startDate, endDate, timezone) {
      try {
        const response = await fetch(
          `https://archive-api.open-meteo.com/v1/archive?latitude=${this.latitude}&longitude=${this.longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,shortwave_radiation&timezone=${timezone}`
        );
        const data = await response.json();
        const climate = data.hourly;
        return climate;
      } catch (error) {
        console.error(error);
        console.log("Algum erro ocorreu.");
        return null;
      }
    }
  
    async addMedia() {
      for (const mes of OpenMeteo.meses) {
        const startDate = `2023-${String(mes.numero).padStart(2, "0")}-01`;
        const endDate = `2023-${String(mes.numero).padStart(2, "0")}-${String(
          mes.dias
        ).padStart(2, "0")}`;
        const climate = await this.getClimate(startDate, endDate, "America/Sao_Paulo");
  
        const temperatures = climate.temperature_2m;
        const ghi = climate.shortwave_radiation;
  
        const length = temperatures.length;
        const somaTemperatura = temperatures.reduce((acc, cur) => acc + cur, 0);
        const mediaTemperatura = somaTemperatura / length;
        mes.mediaTemperatura = Number(mediaTemperatura.toFixed(2));
  
        const somaIrradiacao = ghi.reduce((acc, cur) => acc + cur, 0);
        const mediaIrradiacao = somaIrradiacao / mes.dias;
        mes.mediaIrradiacao = Number(mediaIrradiacao.toFixed(2));
      }
    }
  }
  
  export default OpenMeteo;
  