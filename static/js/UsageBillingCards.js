const UsageBillingCards = {
    props: ['platformVcu', 'platformStorage', 'throughput'],
    template: `
        <div class="d-grid gap-4 grid-column-4 mt-20" id="cards-billing">
            <div class="p-20 usage-card">
                <div class="blue-square">
                    <img src="/usage/static/assets/icons/wallet.svg">
                </div>
                <p class="font-h6 text-uppercase flex-grow-1 text-gray-600 font-semibold">Total payment</p>
                <p class="font-h3 text-gray-800 font-bold" style="font-size: 32px">0 $</p>
            </div>
            <div class="p-20 usage-card">
                <div class="blue-square">
                    <img src="/usage/static/assets/icons/platform-use.svg">
                </div>
                <div class="flex-grow-1">
                    <p class="font-h6 text-uppercase text-gray-600 font-semibold">PLATFORM USE</p>
                    <p class="font-h3 text-uppercase text-gray-800 font-bold">{{ platformVcu }} VCU</p>
                </div>
                <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                    <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">0 $
                </p>
            </div>
            <div class="p-20 usage-card">
                <div class="blue-square">
                    <img src="/usage/static/assets/icons/database.svg">
                </div>
                <div class="flex-grow-1">
                    <p class="font-h6 text-uppercase text-gray-600 font-semibold">Platform storage use</p>
                    <p class="font-h3 text-uppercase text-gray-800 font-bold">{{ platformStorage }}</p>
                </div>
                <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                    <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">0 $
                </p>
            </div>
            <div class="p-20 usage-card">
                <div class="blue-square">
                    <img src="/usage/static/assets/icons/time.svg">
                </div>
                <div class="flex-grow-1">
                    <p class="font-h6 text-uppercase text-gray-600 font-semibold">Storage throughput</p>
                    <p class="font-h3 text-uppercase text-gray-800 font-bold">{{ throughput }}</p>
                </div>
                <p class="font-h5 text-gray-800 font-semibold align-self-end  d-flex">
                    <img src="/usage/static/assets/icons/wallet-blue.svg" class="mr-2">0 $
                </p>
            </div>
        </div>
    `
}