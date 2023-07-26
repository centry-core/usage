const UsageModalVCU = {
    template: `
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content p-28">
                    <div class="modal-card">
                        <p class="font-bold font-h4 mb-4">Virtual compute units limit settings</p>
                        <div class="d-flex justify-content-between">
                            <p class="font-h5 text-gray-800 font-semibold mb-1">Hard limit, VCU</p>
                            <label class="custom-toggle" data-toggle="false">
                                <input aria-expanded="true" type="checkbox" data-target="#selector_quality_gate" data-toggle="collapse" class="">
                                <span class="custom-toggle_slider round"></span>
                            </label>
                        </div>
                        <div class="custom-input mb-3">
                            <input type="text" placeholder="Hard limit">
                        </div>
                        <div class="d-flex my-2">
                            <input
                                    id="radioBtn1"
                                    name="radio-group"
                                    class="mx-2 custom-radio"
                                    type="radio">
                            <label
                                    class="mb-0 w-100 d-flex align-items-center"
                                    for="radioBtn1">
                                <span class="w-100 d-inline-block">Block platform resources only</span>
                            </label>
                        </div>
                        <div class="d-flex my-2">
                            <input
                                    id="radioBtn2"
                                    name="radio-group"
                                    checked
                                    class="mx-2 custom-radio"
                                    type="radio">
                            <label
                                    class="mb-0 w-100 d-flex align-items-center"
                                    for="radioBtn2">
                                <span class="w-100 d-inline-block">Total block</span>
                            </label>
                        </div>
                        
                        <div class="d-flex justify-content-between mt-3">
                            <p class="font-h5 text-gray-800 font-semibold mb-1">Soft limit, VCU</p>
                            <label class="custom-toggle" data-toggle="false">
                                <input aria-expanded="true" type="checkbox" data-target="#selector_quality_gate" data-toggle="collapse" class="">
                                <span class="custom-toggle_slider round"></span>
                            </label>
                        </div>
                        <div class="custom-input mb-3">
                            <input type="text" placeholder="Hard limit">
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="button" class="btn btn-secondary mr-2"
                                 data-dismiss="modal">Cencel</button>
                            <button
                                class="btn btn-basic mr-2 d-flex align-items-center"
                                @click="$emit('delete-task')"
                            >Save<i v-if="loadingDelete" class="preview-loader__white ml-2"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}