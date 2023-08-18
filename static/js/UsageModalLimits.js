const UsageModalLimits = {
    props: [
        'hardLimit',
        'softLimit',
        'limitTotalBlock',
        'type',
    ],
    data() {
        return {
            initData: {},
            canEditHardLimit: true,
            canEditSoftLimit: true,
            isLoading: false,
            modalId: '',
            radioBtnId1: `radioBtnId_${new Date().valueOf() + Math.floor(Math.random() * 100)}`,
            radioBtnId2: `radioBtnId_${new Date().valueOf() + Math.floor(Math.random() * 100)}`,
            nameRadioBtn: `radio-group_${this.type}`
        }
    },
    computed: {
        extFormat() {
            return this.type === 'vcu' ? 'VCU' : 'GB';
        }
    },
    created() {
        this.modalId = `${this.type}Modal`
    },
    mounted() {
          this.initData = Object.assign({}, {
              hardLimit: this.hardLimit,
              softLimit: this.softLimit,
              limitTotalBlock: this.limitTotalBlock ? 'total' : 'resources',
        });
    },
    methods: {
        handleSaveLimit() {
            this.isLoading = true;
            const preparedData = {
                [`${this.type}_hard_limit`]: !this.canEditHardLimit ? this.initData.hardLimit : 0,
                [`${this.type}_soft_limit`]: !this.canEditSoftLimit ? this.initData.softLimit : 0,
                [`${this.type}_limit_total_block`]: this.initData.limitTotalBlock === 'total',
            }
            setTimeout(() => {
                ApiUpdateLimit(preparedData, this.type).then(res => {
                    this.$emit('update-limits', res);
                    this.isLoading = false;
                    $(`#${this.modalId}`).modal('hide');
                })
            }, 500)
        },
        showError() {
            if (this.canEditSoftLimit) return false
            if (this.initData.hardLimit === 0 && this.initData.softLimit === 0) return false
            return this.initData.softLimit >= this.initData.hardLimit;
        },
    },
    template: `
        <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content p-28">
                    <div class="modal-card">
                        <p class="font-bold font-h4 mb-4" v-if="type === 'vcu'">Virtual compute units limit settings</p>
                        <p class="font-bold font-h4 mb-4" v-else>Storage limit settings</p>
                        <div class="d-flex justify-content-between">
                            <p class="font-h5 text-gray-800 font-semibold mb-1">Hard limit, {{ extFormat }}</p>
                            <label class="custom-toggle" data-toggle="false">
                                <input 
                                    @change="canEditHardLimit = !canEditHardLimit"
                                    aria-expanded="true"
                                    type="checkbox" 
                                    data-target="#selector_quality_gate" 
                                    data-toggle="collapse"
                                >
                                <span class="custom-toggle_slider round"></span>
                            </label>
                        </div>
                        <div class="custom-input mb-3">
                            <input 
                                type="number" 
                                :disabled="canEditHardLimit" 
                                placeholder="Hard limit" 
                                v-model="initData.hardLimit">
                        </div>
                        <div class="d-flex my-2">
                            <input
                                    :id="radioBtnId1"
                                    :name="nameRadioBtn"
                                    class="mx-2 custom-radio"
                                    :checked="initData.limitTotalBlock === 'resources'"
                                    @change="$event => initData.limitTotalBlock = $event.target.checked ? 'resources' : 'total'"
                                    :disabled="canEditHardLimit"
                                    type="radio">
                            <label
                                    class="mb-0 w-100 d-flex align-items-center"
                                    :for="radioBtnId1">
                                <span class="w-100 d-inline-block">Block platform resources only</span>
                            </label>
                        </div>
                        <div class="d-flex my-2">
                            <input
                                    :id="radioBtnId2"
                                    :name="nameRadioBtn"
                                    class="mx-2 custom-radio"
                                    :checked="initData.limitTotalBlock === 'total'"
                                    @change="$event => initData.limitTotalBlock = !$event.target.checked ? 'resources' : 'total'"
                                    :disabled="canEditHardLimit"
                                    type="radio">
                            <label
                                    class="mb-0 w-100 d-flex align-items-center"
                                    :for="radioBtnId2">
                                <span class="w-100 d-inline-block">Total block</span>
                            </label>
                        </div>
                        
                        <div class="d-flex justify-content-between mt-3">
                            <p class="font-h5 text-gray-800 font-semibold mb-1">Soft limit, {{ extFormat }}</p>
                            <label class="custom-toggle" data-toggle="false">
                                <input 
                                    @change="canEditSoftLimit = !canEditSoftLimit"
                                    aria-expanded="true" 
                                    type="checkbox" 
                                    data-target="#selector_quality_gate" 
                                    data-toggle="collapse">
                                <span class="custom-toggle_slider round"></span>
                            </label>
                        </div>
                        <div class="custom-input mb-3 need-validation" :class="{'invalid-input': showError()}">
                            <input 
                                type="number" 
                                :disabled="canEditSoftLimit" 
                                placeholder="Soft limit" 
                                v-model="initData.softLimit">
                            <span class="input_error-msg">The soft limit must be less than the hard limit!</span>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="button" class="btn btn-secondary mr-2"
                                 data-dismiss="modal">Cancel</button>
                            <button
                                :disabled="isLoading || showError()"
                                class="btn btn-basic mr-2 d-flex align-items-center"
                                @click="handleSaveLimit"
                            >Save<i v-if="isLoading" class="preview-loader__white ml-2"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}