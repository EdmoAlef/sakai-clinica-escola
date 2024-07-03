<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, reactive, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import http from '@/service/Axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

const initialEvents = ref([]);
const patients = ref([]);
const fullCalendar = ref(null);


const appointment = ref({});
const appointments = ref([]);
const appointmentStatus = ref([]);
const appointmentDialog = ref(false);
const appointmentDialogHeader = ref('');

const selectedAppointmentStatusData = ref(null);

const professors = ref([]);

const submitted = ref(false);

onBeforeMount(async () => {
    initDefaultValues();
});

onMounted(() => {
    getAppointments();
});


const handleEventClick =  async (info) => {
    console.log(info.event.id);
    await http.get(`appointments/${info.event.id}`).then((response) => {
        appointment.value = response.data;
        appointmentDialog.value = true;
        appointmentDialogHeader.value = `Consulta de ${appointment.value.patients.users.name}`;
    });

}

const calendarOptions = reactive({
    plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
    ],
    locale: ptBrLocale,
    displayEventTime: true,
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'timeGridWeek',
    events: initialEvents,
    editable: true,
    selectMirror: true,
    timeFormat: 'HH:mm',
    dayMaxEvents: true,
    weekends: true,
    eventClick: handleEventClick
});

const initDefaultValues = () => { };

const hideDialog = () => {
    appointmentDialog.value = false;
    appointmentDialogHeader.value = '';
    submitted.value = false;
    appointment.value = {};
};

const getAppointments = async () => {
    await http.get('appointments').then((response) => {
        appointments.value = response.data;
        appointments.value.map(appointment => {
            initialEvents.value.push({
                id: appointment.id,
                title: `Consulta : ${appointment.patients.users.name}`,
                start: new Date(appointment.appointment_date).toISOString()
            });
        });
        calendarOptions.events = initialEvents.value;
    });
};

</script>
<style scoped>
.calendar :deep(.fc-button-primary) {
    background-color: var(--primary-color) !important;
    border: none;
}
</style>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card calendar">
                <FullCalendar ref='fullCalendar' :options="calendarOptions" />
            </div>
        </div>
        <div class="col-12">

            <Dialog v-model:visible="appointmentDialog" :style="{ width: '25vw' }" :header="appointmentDialogHeader"
                :modal="true" class="p-fluid">
                <div class="grid">
                    <div class="col-6">
                        <span class="text-900 font-semibold block mb-2">Paciente</span> 
                            <p class="flex align-items-center m-0" >
                                {{appointment.patients.users.name}}
                            </p>
                    </div>
                    <div class="col-6">
                        <span class="text-900 font-semibold block mb-2">Horário</span> 
                            <p class="flex align-items-center m-0" >
                                <i class="pi pi-fw pi-clock text-700 mr-2"></i>
                                {{new Date(appointment.appointment_date).toLocaleString('pt-Br')}}
                            </p>
                    </div>
                    <div class="col-12">
                        <span class="text-900 font-semibold block mb-2">Profissional</span> 
                            <p class="flex align-items-center m-0" >
                                {{appointment.professors.users.name}}
                            </p>
                    </div>
                    <div class="col-12">
                        <span class="text-900 font-semibold block mb-2">Notas</span>
                        <span class="block mb-3">
                            {{ appointment.notes }}
                        </span>
                    </div>
                </div>
               
                <template #footer>
                    <Button label="Cancelar" icon="pi pi-times" severity="warning" text @click="hideDialog" />
                    <Button label="Iniciar Consulta" icon="pi pi-check" text @click="savePatientAppointment" />
                </template>
            </Dialog>
        </div>
    </div>
</template>
