const UsageFilledLine = {
    props: ['limitValues', 'domRefs', 'type', 'color'],
    watch: {
        limitValues: {
            handler: function (newVal, oldVal) {
                this.generateFilledLine(this.type, newVal, ...this.domRefs);
            },
            deep: true
        }
    },
    computed: {
        ext() {
            return this.type === 'vcu' ? 'VCU' : 'GB'
        },
        noLimitId() {
            return this.type === 'vcu' ? 'vcu-nolimit-divider' : 'storage-nolimit-divider'
        }
    },
    methods: {
        generateFilledLine(type, data, refLine, refDivider, refDescription) {
            let formattedPlatformSize = data.platform
            if (type === 'storage') formattedPlatformSize = data.platform / 1000000000;
            const systemSize = Math.ceil(formattedPlatformSize / data.hardLimit * 100);
            const limitPosition = Math.floor(data.softLimit / data.hardLimit * 100);
            let descPosition = limitPosition;
            if (limitPosition >= this.EXTREME_FLAG_RIGHT_POSITION) {
                descPosition = limitPosition - this.CORRECTIVE_OFFSET
            } else if (limitPosition <= this.EXTREME_FLAG_LEFT_POSITION) {
                descPosition = limitPosition + this.CORRECTIVE_OFFSET
            }
            let bgGradient;
            if (formattedPlatformSize < data.softLimit) {
                bgGradient = this.color;
            } else {
                bgGradient = '#D71616'
            }
            const gradientLine = `linear-gradient(to right, ${bgGradient} 0%, ${bgGradient} ${systemSize}%, #EAEDEF ${systemSize}%, #EAEDEF 100%)`;
            $(refLine).css('background', gradientLine);
            $(refDivider).css('left', `${limitPosition}%`);
            $(refDescription).css('left', `${descPosition}%`);
        },
        sliceFormatter(domId) {
            return domId.substring(1)
        }
    },
    template: `
        <div>
            <div v-show="limitValues.hardLimit > 0" :id="sliceFormatter(domRefs[0])" class="position-relative mt-4" style="height: 8px; border-radius: 4px; display: inline-block; width: 100%">
                <span :id="sliceFormatter(domRefs[2])">
                    <img src="/usage/static/assets/icons/flag.svg" class="mr-2">
                    <span class="font-h5 text-gray-600 font-weight-400">{{ limitValues.softLimit }} {{ ext }}</span>
                </span>
                <span :id="sliceFormatter(domRefs[1])"></span>
            </div>
            <div v-show="limitValues.hardLimit === 0">
                <p class="text-right font-h5 text-gray-700">No limit</p>
                <div :id="noLimitId"></div>
            </div>
        </div>
    `
}