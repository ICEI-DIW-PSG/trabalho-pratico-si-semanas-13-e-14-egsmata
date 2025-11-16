// Agrupar capitais por região e gerar o gráfico
fetch(urlCapitais)
  .then(res => res.json())
  .then(data => {
      const contagem = {
          "Norte": 0,
          "Nordeste": 0,
          "Centro-Oeste": 0,
          "Sudeste": 0,
          "Sul": 0
      };

      data.forEach(cap => {
          if (contagem[cap.regiao] !== undefined) {
              contagem[cap.regiao]++;
          }
      });

      const labels = Object.keys(contagem);
      const valores = Object.values(contagem);

      const ctx = document.getElementById("graficoRegioes").getContext("2d");

      new Chart(ctx, {
          type: "bar",
          data: {
              labels: labels,
              datasets: [{
                  label: "Quantidade de Capitais",
                  data: valores,
                  borderWidth: 2
              }]
          },
          options: {
              color: "#E0E0E0",
              scales: {
                  y: { beginAtZero: true }
              }
          }
      });
  })
  .catch(err => console.error("Erro ao carregar dados para gráfico:", err));
