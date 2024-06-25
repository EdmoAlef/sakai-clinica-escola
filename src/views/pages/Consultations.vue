<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import http from '@/service/Axios';

const appointments = ref([]);
const selectedAppointments = ref([]);

const dt = ref(null);
const filters = ref({});

onBeforeMount(() => {
    initFilters();
    initDefaultValues();
});

onMounted(() => {
    getAppointments();
});

const initDefaultValues = () => { };

const getAppointments = async () => {
    await http.get('consultations').then((response) => {
        appointments.value = response.data;
    });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <DataTable ref="dt" :value="appointments" v-model:selection="selectedAppointments" dataKey="id"
                    :paginator="true" :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords}">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Consultas</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value"
                                    placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>
                    <Column field="id" header="ID" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ID</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>
                    <Column field="appointment_date" header="Data" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Data Agendada</span>
                            {{ new Date(slotProps.data.schedule).toLocaleString() }}
                        </template>
                    </Column>
                    <Column field="patient" header="Paciente" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Paciente</span>
                            {{ slotProps.data.appointments.patients.users.name }}
                        </template>
                    </Column>
                    <Column field="professor" header="Psicólogo" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Psicologo</span>
                            {{ slotProps.data.appointments.professors.users.name }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Ações">
                        <template #body="slotProps">
                            <Button icon="pi pi-calendar" class="mr-2" severity="info" rounded />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
