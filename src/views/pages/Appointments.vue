<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import http from '@/service/Axios';

const toast = useToast();

const patients = ref([]);
const userDialog = ref(false);
const userProfileDialog = ref(false);
const deleteuserDialog = ref(false);
const deleteuserProfileDialog = ref(false);
const user = ref({});
const userProfile = ref({});
const dt = ref(null);
const filters = ref({});
const professors = ref(null);

const submitted = ref(false);
const defaultProfiles = ref([]);
const edit = ref({});

const selectedProfile = ref([]);

onBeforeMount(() => {
    initFilters();
    initDefaultValues();
});

onMounted(() => {
    getUsers();
    console.log(patients.value)
});

const getUsers = async () => {
    await http.get('patients').then((response) => {
        patients.value = response.data;
    });
}

const initDefaultValues = () => {
    defaultProfiles.value = {...[
        { name: 'Paciente', value: 1, route: 'patients' , disabled : false}
    ]};

    selectedProfile.value = { name: 'Paciente', value: 1, route: 'patients' };
}

const openNew = () => {
    patients.value = {};
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    userProfileDialog.value = false;
    submitted.value = false;
};

const saveUserProfile = async () => {
    submitted.value = true;
    let formAction = getDataToSend();
    if (!userProfile.value.edit) {
        formAction.append('id', user.value.id);
        await http.post(selectedProfile.value.route, formAction).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil Salvo com Sucesso', life: 4000 });
            userProfileDialog.value = false;
            user.value = {};
            userProfile.value = {};
            submitted.value = false;
        }).catch((error) => {
            userProfile.value.id = null;
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o perfil', life: 4000 });

        });
    } else {
        delete userProfile.value.edit;
        await http.put(`${selectedProfile.value.route}/${userProfile.value.id}`, formAction).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil Alterado Com Sucesso', life: 4000 });
            userProfileDialog.value = false;
            user.value = {};
            userProfile.value = {};
            submitted.value = false;
        }).catch((error) => {
            userProfile.value.id = null;
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o perfil', life: 4000 });
        });
    }
};

const getDataToSend = () => {
    let data = new FormData();
    switch (selectedProfile.value.value) {
        case 1:
            data.append('allergies', userProfile.value.allergies);
            data.append('medical_conditions', userProfile.value.medical_conditions);
            break;
        case 2:
            data.append('professional_registration', userProfile.value.professional_registration);
            break;
        case 3:
            data.append('registration', userProfile.value.registration);
            data.append('semester', userProfile.value.semester);
            data.append('advisor_id', userProfile.value.advisor_id);
            break;
    }

    return data;
}

const saveUser = async () => {
    submitted.value = true;

    if (user.value.birth_date) {
        user.value.birth_date = user.value.birth_date.toISOString().slice(0, 10);
    }

    if (user.value.phone) {
        user.value.phone = phone.value.replace(/\D/g, '');;
    }

    if (user.value.cpf) {
        user.value.cpf = cpf.value.replace(/\D/g, '');;
    }

    if (!user.value.id) {
        await http.post('users', user.value).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Salvo Com Sucesso', life: 4000 });
            userDialog.value = false;
            submitted.value = false;
            user.value = {};

            getUsers();
        }).catch((error) => {
            // console.log(error);
        });

    } else {
        await http.put(`users/${user.value.id}`, user.value).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Alterado Com Sucesso', life: 4000 });
            userDialog.value = false;
            submitted.value = false;
            user.value = {};
            getUsers();
        }).catch((error) => {
            // console.log(error);
        });
    }
};

const editUser = (editUser) => {
    user.value = { ...editUser };
    userDialog.value = true;
};

const getProfile = async () => {
    initDefaultValues();
    userProfile.value = {};
    await http.get(`patients/${user.value.id}`).then((response) => {
        console.log("adasdasd");

        if (response.data) {
            userProfile.value = {};
            userProfile.value.allergies          = response.data.allergies;
            userProfile.value.medical_conditions = response.data.medical_conditions;
            userProfile.value.id                 = response.data.id;
            userProfile.value.edit               = true;
            edit.value.tipo                      = 1;
            defaultProfiles.value[1].disabled = true;
            defaultProfiles.value[2].disabled = true;
            console.log('1');
            selectedProfile.value = { name: 'Paciente', value: 1, route: 'patients' };
        }
    }).catch((error) => {
        console.log("adasdasd");
    });

    await http.get(`professors/${user.value.id}`).then((response) => {
        if (response.data) {
            userProfile.value = {};
            userProfile.value.professional_registration = response.data.professional_registration;
            userProfile.value.id                 = response.data.id;
            userProfile.value.edit               = true;
            edit.value.tipo                      = 2;
            defaultProfiles.value[0].disabled = true;
            defaultProfiles.value[2].disabled = true;
            console.log('2');

            selectedProfile.value = { name: 'Professor', value: 2, route: 'professors' };
        }
    }).catch((error) => {

    })

    await http.get(`students/${user.value.id}`).then((response) => {
        if (response.data) {
            userProfile.value = {};
            userProfile.value = response.data;
            userProfile.value.edit = true;
            edit.value.tipo = 3;
            selectedProfile.value = { name: 'Aluno', value: 3, route: 'students' };
            defaultProfiles.value[0].disabled = true;
            defaultProfiles.value[1].disabled = true;
            console.log('3');

        }
    }).catch((error) => {

    });
}

const editProfile = async (editProfile) => {
    user.value = { ...editProfile };
    await getProfile();
    userProfileDialog.value = true;
};

const confirmeDeleteUser = (editUser) => {
    user.value = editUser;
    deleteuserDialog.value = true;
};

const changeProfile = async () => {
    await findProfessors();
};

const findProfessors = async () => {
    professors.value  = [];
    await http.get(`professors`).then(async (response) => {
        let data = response.data;
        data.map(professor =>  {
            professors.value.push({
                name : professor.users.name,
                value : professor.users.id
            });
        })
    });
}

const deleteUser = async () => {
    await http.delete(`users/${user.value.id}`).then(async (response) => {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Deletado Com Sucesso', life: 4000 });
        deleteuserDialog.value = false;
        user.value = {};
        defaultProfiles.value = {};
        await getUsers();
    });
};

const deleteUserProfile = async () => {
    await http.delete(`${selectedProfile.value.route}/${userProfile.value.id}`).then(async (response) => {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil desvinculado com Sucesso', life: 4000 });
        userProfileDialog.value = false;
        deleteuserProfileDialog.value = false;
        userProfile.value = {};
        defaultProfiles.value = {};
        edit.value.tipo  = 1;
        initDefaultValues();
        await getProfile();
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
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Novo Usuário" icon="pi pi-plus" class="mr-2" severity="success"
                                @click="openNew" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="patients" v-model:selection="selectedProducts" dataKey="id" :paginator="true"
                    :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords} usuários">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Pacientes</h5>
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
                    <Column field="name" header="Nome" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Nome</span>
                            {{ slotProps.data.users.name }}
                        </template>
                    </Column>
                    <Column field="cpf" header="CPF" :sortable="true" headerStyle="min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">CPF</span>
                            {{ slotProps.data.users.cpf }}
                        </template>
                    </Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Email</span>
                            {{ slotProps.data.users.email }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" header="Ações">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded
                                @click="editUser(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mr-2 mt-2" severity="warning" rounded
                                @click="confirmeDeleteUser(slotProps.data)" />

                            <Button icon="pi pi-users" class="mt-2" severity="info" rounded
                                @click="editProfile(slotProps.data)" />
                        </template>
                    </Column>

                </DataTable>

                <Dialog v-model:visible="userDialog" :style="{ width: '600px' }" header="Usuário" :modal="true"
                    class="p-fluid">
                    <img :src="'/demo/images/product/' + user.image" :alt="user.image" v-if="user.image" width="150"
                        class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field">
                        <label for="name">Nome</label>
                        <InputText id="name" v-model.trim="user.name" required="true" autofocus
                            :invalid="submitted && !user.name" />
                        <small class="p-invalid" v-if="submitted && !user.name">Nome é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="naemailme">Email</label>
                        <InputText id="email" type="email" v-model.trim="user.email" required="true" autofocus
                            :invalid="submitted && !user.email" />
                        <small class="p-invalid" v-if="submitted && !user.email">Email é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="password">Senha</label>
                        <Password toggleMask id="password" type="password" v-model.trim="user.password" required="true"
                            autofocus :invalid="submitted && !user.password" />
                        <small class="p-invalid" v-if="submitted && !user.password">Senha é obrigatório.</small>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="birth_date">Nascimento</label>
                            <Calendar id="birth_date" v-model="user.birth_date" dateFormat="dd/mm/yy"
                                :invalid="submitted && !user.birth_date" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.birth_date">Nascimento é
                                obrigatório.</small>
                        </div>
                        <div class="field col">
                            <label for="cpf">CPF</label>
                            <InputText id="cpf" v-model="user.cpf" :invalid="submitted && !user.cpf" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.cpf">CPF é obrigatório.</small>
                        </div>
                    </div>

                    <div class="field">
                        <label for="address">Endereço</label>
                        <InputText id="address" type="address" v-model.trim="user.address" required="true" autofocus
                            :invalid="submitted && !user.address" />
                        <small class="p-invalid" v-if="submitted && !user.address">Endereço é obrigatório.</small>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="number">Número</label>
                            <InputNumber id="number" v-model="user.number" />
                        </div>
                        <div class="field col">
                            <label for="complement">Complemento</label>
                            <InputText id="complement" v-model="user.complement" />
                        </div>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="zip_code">CEP</label>
                            <InputNumber id="zip_code" v-model="user.zip_code" />
                        </div>
                        <div class="field col">
                            <label for="phone">Telefone</label>
                            <InputMask id="phone" mask="(99)99999-9999" v-model="user.phone"
                                :invalid="submitted && !user.phone" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.phone">Telefone é obrigatório.</small>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" severity="warning" text="" @click="hideDialog" />
                        <Button label="Salvar" icon="pi pi-check" text="" @click="saveUser" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="userProfileDialog" :style="{ width: '600px' }" header="Perfils do Usuário"
                    :modal="true" class="p-fluid">
                    <img :src="'/demo/images/product/' + user.image" :alt="user.image" v-if="user.image" width="150"
                        class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field text-center">
                        <small>Configuração de perfil para {{ user.name }}</small>
                        <SelectButton v-model="selectedProfile" :options="defaultProfiles" @click="changeProfile"
                            class="mt-4" optionDisabled="disabled" optionLabel="name" aria-labelledby="basic" />
                    </div>
                    <div class="field" v-if="selectedProfile.value == 1">
                        <label for="allergies">Alergias</label>
                        <Textarea v-model="userProfile.allergies" id="allergies" autoResize rows="5" cols="30" />
                    </div>
                    <div class="field" v-if="selectedProfile.value == 1">
                        <label for="medical_conditions">Condição Médica</label>
                        <Textarea v-model="userProfile.medical_conditions" id="medical_conditions" autoResize rows="5"
                            cols="30" />
                    </div>
                    <div class="field" v-if="selectedProfile.value == 2">
                        <label for="professional_registration">Registro Profissional</label>
                        <InputText v-model="userProfile.professional_registration" id="professional_registration"
                            :invalid="submitted && !userProfile.professional_registration && selectedProfile.value == 2"
                            :required="true" />
                    </div>

                    <div class="formgrid grid" v-if="selectedProfile.value == 3">
                        <div class="field col">
                            <label for="registration">Matricula</label>
                            <InputText v-model="userProfile.registration" id="registration"
                                :invalid="submitted && !userProfile.registration && selectedProfile.value == 3"
                                :required="true" />
                        </div>
                        <div class="field col">
                            <label for="semester">Semestre</label>
                            <InputText v-model="userProfile.semester" id="semester"
                                :invalid="submitted && !userProfile.registration && selectedProfile.value == 3"
                                :required="true" />
                        </div>
                    </div>
                    <div class="field" v-if="selectedProfile.value == 3">
                        <label for="advisor_id">Professor Responsável</label>
                        <Dropdown v-model="userProfile.advisor_id" :options="professors" optionLabel="name"/>
                    </div>

                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" severity="warning" text="" @click="hideDialog" />
                        <Button label="Desvincular" v-if="userProfile.id && selectedProfile.value == edit.tipo" 
                            icon="pi pi-times" severity="danger" text=""
                            @click="deleteuserProfileDialog = true" />
                        <Button label="Salvar" icon="pi pi-check" text="" @click="saveUserProfile" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteuserProfileDialog" :style="{ width: '450px' }" header="Atenção!"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="user">Tem certeza irá desvincular o perfil <b>{{ selectedProfile.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" severity="warning" text
                            @click="deleteuserProfileDialog = false" />
                        <Button label="Sim" icon="pi pi-check" text @click="deleteUserProfile" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteuserDialog" :style="{ width: '450px' }" header="Atenção!" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="user">Tem certeza que irá excluir o usuário <b>{{ user.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" severity="warning" text @click="deleteuserDialog = false" />
                        <Button label="Sim" icon="pi pi-check" text @click="deleteUser" />
                    </template>
                </Dialog>

            </div>
        </div>
    </div>
</template>
