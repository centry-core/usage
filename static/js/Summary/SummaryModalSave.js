const modalSavePreset = {
    props: ['loading', 'allPresets'],
    data() {
        return {
            presetTitle: '',
            clickedSubmit: false,
        }
    },
    computed: {
        hasError() {
            return this.isShortName() && this.clickedSubmit;
        },
        nameAlreadyExists() {
            return this.allPresets.find(preset => preset.name === this.presetTitle)
        }
    },
    methods: {
        isShortName() {
            return this.presetTitle.length < 3;
        },
        saveNewPreset() {
            this.clickedSubmit = true;
            if (!this.hasError) this.$emit('save-new-preset', this.presetTitle)
        }
    },
    template: `
        <div class="modal-component">
            <div class="modal-card">
                <p class="font-bold font-h3 mb-4">Create preset</p>
                <div class="custom-input" :class="{'invalid-input': hasError || nameAlreadyExists}">
                    <input
                        type="text"
                        v-model="presetTitle"
                        placeholder="Text">
                    <span class="mt-1 d-block" style="color: var(--error); font-size: 12px" v-if="hasError">Preset name less then 3 letters.</span>
                    <span v-if="nameAlreadyExists" class="mt-1 d-block" style="color: var(--error); font-size: 12px">This name already exists.</span>
                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" class="btn btn-secondary mr-2" @click="$emit('close-modal')">Cencel</button>
                        <button
                            :disabled="hasError"
                            class="btn btn-basic mr-2 d-flex align-items-center"
                            type="submit"
                            @click="saveNewPreset"
                        >Save <i v-show="loading" class="preview-loader__white ml-2"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `
}