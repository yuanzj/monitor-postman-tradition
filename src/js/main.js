'use strict';

const BaseUrl = "http://192.168.102.17:8889/v1.0/";

function buildUrl(path) {
    return BaseUrl + path;
}

var collectionsVm = new Vue({
    el: '#collections',
    data: {
        operationIndex: -1,
        deleteModel: false,
        monitors: []
    },
    mounted() {
        //load monitors
        this.loadMonitors();
        //auto refresh
        setInterval(this.loadMonitors, 60 * 1000);
    },
    methods: {
        loadMonitors: function () {
            axios.get(buildUrl('monitors')).then((response) => {
                this.monitors = response.data.data;
            }).catch(error => {
                console.log(error);
            });
        },
        dateFormat: function (time) {
            var unixTimestamp = new Date(time);
            return unixTimestamp.toLocaleString();
        },
        isRunning: function (index) {
            if (index >= 0) {
                return this.monitors[index].running;
            } else {
                return false;
            }
        },
        onItemClick: function (index, delModel) {
            this.operationIndex = index;
            this.deleteModel = delModel;
        },
        operation: function (index) {
            if (index >= 0) {
                var monitor = this.monitors[index];

                if (this.deleteModel) {
                    axios.delete(buildUrl('monitors') + '?monitorId=' + monitor.id).then((response) => {
                        if (response.data.code === 0) {
                            this.operationIndex = -1;
                            this.deleteModel = false;
                            this.monitors.splice(index, 1);
                        }
                        $('#affirmDialog').modal('hide');
                    }).catch(error => {
                        console.log(error);
                    });
                } else {
                    if (monitor.running) {
                        axios.put(buildUrl('monitors/stop') + '?monitorId=' + monitor.id).then((response) => {
                            if (response.data.code === 0) {
                                monitor.running = false;
                            }
                            $('#affirmDialog').modal('hide');
                        }).catch(error => {
                            console.log(error);
                        });

                    } else {
                        axios.put(buildUrl('monitors/start') + '?monitorId=' + monitor.id).then((response) => {
                            if (response.data.code === 0) {
                                monitor.running = true;
                            }
                            $('#affirmDialog').modal('hide');
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }
            } else {
                $('#affirmDialog').modal('hide');
            }
        }
    }
});


var addCollectionVm = new Vue({
    el: '#addMonitorModal',
    data: {
        monitorName: '',

        collectionFile: '',
        environmentFile: '',

        scheduleTypeSelected: '1',
        scheduleTypeOptions: [
            {text: 'Minute Timer', value: '1'}
        ],

        scheduleSelected: '1',
        scheduleOptions: [
            {text: 'Every 1 Minutes', value: '1'},
            {text: 'Every 5 Minutes', value: '5'},
            {text: 'Every 10 Minutes', value: '10'},
            {text: 'Every 15 Minutes', value: '15'},
            {text: 'Every 20 Minutes', value: '20'},
            {text: 'Every 30 Minutes', value: '30'}
        ]
    },
    mounted() {

    },
    methods: {
        onAddCollectionFile: function (event) {
            this.collectionFile = event.target.files[0];
        },
        onAddEnvironmentFile: function (event) {
            this.environmentFile = event.target.files[0];
        },
        addMonitor: function () {

            let formData = new FormData();
            formData.append('monitorName', this.monitorName);
            formData.append('collectionFile', this.collectionFile);
            formData.append('environmentFile', this.environmentFile);
            formData.append('intervalType', this.scheduleTypeSelected);
            formData.append('interval', this.scheduleSelected);

            let config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            axios.post(buildUrl('monitors'), formData, config).then(function (response) {
                console.log(response);

                if (response.data.code === 0) {
                    collectionsVm.loadMonitors();
                }

                $('#addMonitorModal').modal('hide');
            }).catch(error => {
                console.log(error);

                $('#addMonitorModal').modal('hide');
            });

        }
    }
});




