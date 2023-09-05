const SummaryCards = {
    props: ['cardsData'],
    data() {
        return {
            totalPrompts: 0,
        }
    },
    mounted() {
        this.$nextTick(() => {
            ApiFetchPrompts().then(prompts => {
                this.totalPrompts = prompts.length;
            })
        })
    },
    template: `
        <div class="d-grid grid-column-5 gap-3 mt-3 colorful-cards">
            <div class="card card-sm card-blue">
                <div class="card-header">
                    <span>
                        {{ cardsData.users }}
                    </span>
                </div>
                <div class="card-body">USERS</div>
            </div>
            <div class="card card-sm card-blue">
                <div class="card-header">
                    <span>
                        {{ totalPrompts }}
                    </span>
                </div>
                <div class="card-body">PROMPTS TOTAL</div>
            </div>
            <div class="card card-sm card-blue">
                <div class="card-header">
                    <span>
                        {{ cardsData.predictsTotal }}
                    </span>
                </div>
                <div class="card-body">PREDICTS TOTAL</div>
            </div>
            <div class="card card-sm card-blue">
                <div class="card-header">
                    <span>
                        {{ cardsData.successfulPredicts }}
                    </span>
                </div>
                <div class="card-body">SUCCESSFUL PREDICTS</div>
            </div>
            <div class="card card-sm card-blue">
                <div class="card-header">
                    <span>
                        {{ cardsData.embenddings }}
                    </span>
                </div>
                <div class="card-body">EMBEDDINGS</div>
            </div>
        </div>
    `
}