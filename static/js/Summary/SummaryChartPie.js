const SummaryChartPie = {
    props: ['isLoading', 'chartId', 'type', 'labels', 'datasets'],
    watch: {
        labels: {
            handler: function (newVal, oldVal) {
                this.generateLineChartPrompts();
            },
            deep: true
        }
    },
    methods: {
        generateLineChartPrompts() {
            this.$nextTick(() => {
                window.promptsPieChart = new Chart(document.getElementById(this.chartId), {
                    type: 'pie',
                    data: {
                        labels: this.labels,
                        datasets: this.datasets,
                    },
                    options: {
                        plugins: {
                            legend: {
                                display: false,
                            }
                        },
                    }
                });
            })
        },
    },
    template: `
        <div class="mt-20">
            <div class="position-relative" style="min-height: 300px;">
                <div class="layout-spinner" v-if="isLoading">
                    <div class="spinner-centered">
                        <i class="spinner-loader__32x32"></i>
                    </div>
                </div>
                <template v-else>
                    <div v-show="!labels.length" style="background: #FAFBFD;" class="h-100 rounded-lg">
                        <div class="d-flex justify-content-center align-items-center h-100">
                            <div class="d-flex flex-column align-items-center">
                                <p class="font-h5 text-gray-500 pb-2">No data for this period</p>
                                <img src="/design-system/static/assets/ico/icon_empty-chart.svg">
                            </div>
                        </div>
                    </div>
                    <canvas v-show="labels.length" :id="chartId"></canvas>
                </template>
            </div>
        </div>
    `
}