<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import http from '@/service/Axios';

const toast = useToast();
const consultation = ref([]);
const professor = ref([]);
const patient = ref([]);

const anamneses = ref([]);
const anamnese = ref({});

const filters = ref({});
const submitted = ref(false);

const clinicalRecords = ref([])
const clinicalRecord = ref({});

const clinicalRecordDialog = ref(false);

onBeforeMount(() => {
    initFilters();
    initDefaultValues();
});

onMounted(() => {
    getConsultation();
});

const initDefaultValues = () => {

    patient.value = {
        users: {
            name: '',
            email: '',
            phone: '',
            birth_date: '',
            age: ''
        },
        allergies: '',
        medical_conditions: ''
    };

    professor.value = {
        users: {
            name: ''
        }
    };

    anamnese.value = {
        patient_id: '',
        consultation_reason: '',
        medical_history: '',
        psychological_history: '',
        family_history: '',
        disorder_history: '',
        significant_events: '',
        interpersonal_relationships: '',
        behavioral_development: '',
        emotional_development: ''
    };

    clinicalRecord.value = {
        id: '',
        patient_id: '',
        diagnosis: '',
        previous_treatments: '',
        session_notes: '',
        patient_progress: '',
        intervention_strategy: '',
        observations: ''
    };

};

const stringAge = (birth_date) => {
    let birthDate = new Date(birth_date);
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let month = today.getMonth() - birthDate.getMonth();
    let day = today.getDate() - birthDate.getDate();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        month += 12;
    }
    if (day < 0) {
        month--;
        day += 30;
    }

    let ageString = `${age} anos, ${month} meses e ${day} dias`;
    return ageString;
};

const getConsultation = async () => {
    await http.get('consultations/1').then((response) => {
        consultation.value = response.data;
        patient.value = response.data.appointments.patients;
        if (patient.value.users.birth_date) {
            //calcular idade do paciente, quantidade de meses e dias
            patient.value.users.age = stringAge(patient.value.users.birth_date);
        }
        professor.value = response.data.appointments.professors;
        anamnese.value.patient_id = patient.value.id;

        getAnamnese();
        getClinicalRecords();
    });
};

const getAnamnese = async () => {
    await http.get(`anamneses/patients/${patient.value.id}`).then((response) => {
        console.log(response.data)
        if (response.data.length > 0) {
            anamnese.value = response.data[0];
        }
    });
};

const getClinicalRecords = async () => {
    await http.get(`clinical-records/patients/${patient.value.id}`).then((response) => {
        clinicalRecords.value = response.data;
    });
};

//inserir ou atualizar anamnese
const saveAnamnese = async () => {
    submitted.value = true;
    let anamneseData = { ...anamnese.value };

    let required = [
        'patient_id'
    ];

    let label = {
        'patient_id': 'Paciente'
    };

    required.forEach((field) => {
        if (!anamneseData[field]) {
            toast.add({ severity: 'error', summary: 'Erro', detail: `Não há ${label[field]} associado`, life: 4000 });
        }
    });

    if (required.some(field => !anamneseData[field])) {
        return;
    }
    console.log(anamneseData?.value?.id)
    if (!anamneseData?.value?.id) {
        await http.post('anamneses', anamneseData).then((data) => {
            submitted.value = false;

            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Anamnese Salva Com Sucesso', life: 4000 });
        }).catch(() => {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao Salvar Anamnese', life: 4000 });
        });

    } else {

        await http.put(`anamneses/${anamnese.value.id}`, anamneseData).then(() => {
            submitted.value = false;
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Anamnese Alterada Com Sucesso', life: 4000 });
        }).catch(() => {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao Alterar Anamnese', life: 4000 });
        });

    }
};

const hideDialog = () => {
    clinicalRecordDialog.value = false;
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

//function for phone mask
const maskPhone = (value) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
};

//function for two initials of the name
const initials = (name) => {
    let nameArray = name.split(' ');
    let initials = nameArray[0].charAt(0) + nameArray[nameArray.length - 1].charAt(0);
    return initials.toUpperCase();
};

const openNewClinicalRecord = () => {
    clinicalRecord.value = {};
    submitted.value = false;
    clinicalRecordDialog.value = true;
};

const editClinicalRecord = (data) => {
    clinicalRecordDialog.value = true;
    clinicalRecord.value = { ...data };
};

const saveClinicalRecord = async () => {
    submitted.value = true;
    let _clinicalRecord = { ...clinicalRecord.value };

    _clinicalRecord.patient_id = patient.value.id;

    if (!clinicalRecord.value.id) {
        await http.post('clinical-records', _clinicalRecord).then(() => {
            submitted.value = false;
            clinicalRecordDialog.value = false;
            getClinicalRecords();
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Registro Clínico Salvo Com Sucesso', life: 4000 });
        }).catch(() => {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao Salvar Registro Clínico', life: 4000 });
        });

    } else {
        await http.put(`clinical-records/${clinicalRecord.value.id}`, _clinicalRecord).then(() => {
            submitted.value = false;
            clinicalRecordDialog.value = false;
            getClinicalRecords();
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Registro Clínico Alterado Com Sucesso', life: 4000 });
        }).catch(() => {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao Alterar Registro Clínico', life: 4000 });
        });
    }
};
</script>
<style>
.p-timeline-event-opposite {
    flex: initial !important;
}
</style>
<template>
    <div class="grid">
        <div class="col-12">
            <Splitter style="min-height: 200px;">
                <SplitterPanel :size="30" :minSize="10">
                    <div className="h-full flex align-items-center justify-content-center m-2">
                        <div class="grid">
                            <div class="col-12 h-full flex align-items-center justify-content-center">
                                <Avatar :label="initials(patient.users.name)" class="" size="xlarge" shape="circle">
                                </Avatar>
                            </div>
                            <div class="col-12 align-items-center justify-content-center">
                                <div class="flex align-items-center justify-content-center">
                                    <h5>{{ patient.users.name }}</h5>
                                </div>
                                <div class="flex align-items-center justify-content-center mb-2">
                                    <span>{{ patient.users.age }}</span>
                                </div>
                                <div class="flex align-items-center justify-content-center mb-2">
                                    <span>{{ maskPhone(patient.users.phone) }}</span>
                                </div>
                                <div class="flex align-items-center justify-content-center mb-2">
                                    <span>{{ patient.users.email }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- informacoes do paciente abaixo -->

                    </div>
                </SplitterPanel>
                <SplitterPanel :size="70" :minSize="10">
                    <div class="p-fluid">
                        <Panel header="Informações do Paciente" :toggleable="true" class="m-5">
                            <div class="p-fluid formgrid grid">
                                <div class="field col-12 md:col-6">
                                    <label for="allergies">Alergias</label>
                                    <Textarea v-model="patient.allergies" id="allergies" autoResize />
                                </div>
                                <div class="field col-12 md:col-6">
                                    <label for="medical_conditions">Condições Médicas</label>
                                    <Textarea v-model="patient.medical_conditions" id="medical_conditions" autoResize />
                                </div>
                            </div>
                        </Panel>
                    </div>
                </SplitterPanel>
            </Splitter>
        </div>

        <div class="col-12">
            <Panel header="Anamnese" :toggleable="true" :collapsed="true">
                <!-- <div class="card-header mb-4 flex">
                    <h5>Anamnese</h5>
                    <Button label="Adicionar Anamnese" icon="pi pi-plus" class="ml-auto" @click="saveAnamnese" />
                </div> -->
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="consultation_reason">Motivo da Consulta</label>
                        <Textarea v-model="anamnese.consultation_reason" id="consultation_reason" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="medical_history">Histórico Médico</label>
                        <Textarea v-model="anamnese.medical_history" id="medical_history" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="psychological_history">Histórico Psicológico</label>
                        <Textarea v-model="anamnese.psychological_history" id="psychological_history" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="family_history">Histórico Familiar</label>
                        <Textarea v-model="anamnese.family_history" id="family_history" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="disorder_history">Histórico de Transtornos</label>
                        <Textarea v-model="anamnese.disorder_history" id="disorder_history" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="significant_events">Eventos Significativos</label>
                        <Textarea v-model="anamnese.significant_events" id="significant_events" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="interpersonal_relationships">Relacionamentos Interpessoais</label>
                        <Textarea v-model="anamnese.interpersonal_relationships" id="interpersonal_relationships"
                            autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="behavioral_development">Desenvolvimento Comportamental</label>
                        <Textarea v-model="anamnese.behavioral_development" id="behavioral_development" autoResize />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="emotional_development">Desenvolvimento Emocional</label>
                        <Textarea v-model="anamnese.emotional_development" id="emotional_development" autoResize />
                    </div>
                    <div class="field col-12">
                        <Button @click="saveAnamnese" label="Salvar Anamnese" />
                    </div>
                </div>
            </Panel>
        </div>
    </div>

    <div class="card">
        <div class="card-header mb-4 flex">
            <h5>Registro Clínico</h5>
            <Button label="Adicionar Registro Clínico" icon="pi pi-plus" class="ml-auto" @click="openNewClinicalRecord" />
        </div>

        <Timeline :value="clinicalRecords" align="left" class="customized-timeline">
            <template #marker="slotProps">
                <span
                    class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-2"
                    :style="{ backgroundColor: 'green' }">
                    <i class="pi pi-angle-right"></i>
                </span>
            </template>
            <template #opposite="slotProps">
                <span class="customized-timeline-opposite">
                    {{ new Date(slotProps.item.created_at).toLocaleDateString() + ' ' + new
                        Date(slotProps.item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    }}
                </span>
            </template>
            <template #content="slotProps">
                <Card class="mb-5">
                    <template #title>
                        Realizada por {{ professor.users.name }}
                    </template>
                    <template #content>
                        <div class="grid">
                            <div class="col-12">
                                <p><b>Diagnóstico:</b></p>
                                <span>{{ slotProps.item.diagnosis }}</span>
                            </div>
                            <div class="col-12">
                                <p><b>Tratamentos Anteriores:</b></p>
                                <span>{{ slotProps.item.previous_treatments }}</span>

                            </div>
                            <div class="col-12">
                                <p><b>Notas da Sessão:</b></p>
                                <span>{{ slotProps.item.session_notes }}</span>
                            </div>
                            <div class="col-12">
                                <p><b>Progresso do Paciente:</b></p>
                                <span>{{ slotProps.item.patient_progress }}</span>
                            </div>
                            <div class="col-12">
                                <p><b>Estratégia de Intervenção:</b></p>
                                <span>{{ slotProps.item.intervention_strategy }}</span>
                            </div>
                            <div class="col-12">
                                <p><b>Observações:</b></p>
                                <span>{{ slotProps.item.observations }}</span>
                            </div>
                            <div class="col-12">
                                <Button label="Editar" icon="pi pi-pencil" class="mr-2"
                                    @click="editClinicalRecord(slotProps.item)" />
                            </div>
                        </div>
                    </template>
                </Card>
            </template>
        </Timeline>
    </div>
    <Dialog v-model:visible="clinicalRecordDialog" :style="{ width: '50vw' }" header="Registro Clínico" :modal="true"
        class="p-fluid">
        <div class="p-fluid formgrid grid">
            <div class="field col-12 md:col-6">
                <label for="diagnosis">Diagnóstico</label>
                <Textarea v-model="clinicalRecord.diagnosis" id="diagnosis" autoResize />
            </div>
            <div class="field col-12 md:col-6">
                <label for="previous_treatments">Tratamentos Anteriores</label>
                <Textarea v-model="clinicalRecord.previous_treatments" id="previous_treatments" autoResize />
            </div>
            <div class="field col-12 md:col-6">
                <label for="session_notes">Notas da Sessão</label>
                <Textarea v-model="clinicalRecord.session_notes" id="session_notes" autoResize />
            </div>
            <div class="field col-12 md:col-6">
                <label for="patient_progress">Progresso do Paciente</label>
                <Textarea v-model="clinicalRecord.patient_progress" id="patient_progress" autoResize />
            </div>
            <div class="field col-12 md:col-6">
                <label for="intervention_strategy">Estratégia de Intervenção</label>
                <Textarea v-model="clinicalRecord.intervention_strategy" id="intervention_strategy" autoResize />
            </div>
            <div class="field col-12 md:col-6">
                <label for="observations">Observações</label>
                <Textarea v-model="clinicalRecord.observations" id="observations" autoResize />
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" severity="warning" text="" @click="hideDialog" />
            <Button label="Salvar" icon="pi pi-check" text="" @click="saveClinicalRecord" />
        </template>
    </Dialog>
</template>