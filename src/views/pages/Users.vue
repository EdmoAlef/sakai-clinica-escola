<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import http from '@/service/Axios';

const toast = useToast();

const users = ref([]);
const userDialog = ref(false);
const deleteuserDialog = ref(false);
const user = ref({});
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    getUsers();
    console.log(users.value)
});

const getUsers = async () => {
    await http.get('users').then((response) => {
        users.value = response.data;
    });
}

console.log(user.value);

const openNew = () => {
    user.value = {};
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

const saveUser = async () => {
    submitted.value = true;

    if (user.value.birth_date) {
        user.value.birth_date = user.value.birth_date.toISOString().slice(0, 10);
    }
    
    if (user.value.phone) {
        user.value.phone = phone.value.replace(/\D/g,''); ;
    }
    
    if (user.value.cpf) {
        user.value.cpf = cpf.value.replace(/\D/g,''); ;
    }

    if (!user.value.id) {
        await http.post('users', user.value).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Salvo Com Sucesso', life: 4000 });
            userDialog.value = false;
            user.value = {};
            getUsers();
        }).catch((error) => {
            // console.log(error);
        });
    }else{
        await http.put(`users/${user.value.id}`, user.value).then((response) => {
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Alterado Com Sucesso', life: 4000 });
            userDialog.value = false;
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

const confirmeDeleteUser = (editUser) => {
    user.value = editUser;
    deleteuserDialog.value = true;
};

const deleteUser = async () => {
    await http.delete(`users/${user.value.id}`).then(async (response) => {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Deletado Com Sucesso', life: 4000 });
        deleteuserDialog.value = false;
        user.value = {};
        await getUsers();
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
                            <Button label="Novo Usuário" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="users"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords} usuários"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Usuários</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>
                    <Column field="id" header="ID" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ID</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Nome</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="cpf" header="CPF" :sortable="true" headerStyle="min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">CPF</span>
                            {{ slotProps.data.cpf }}
                        </template>
                    </Column>
                    <Column field="email" header="email" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Email</span>
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editUser(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmeDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="userDialog" :style="{ width: '600px' }" header="Usuário" :modal="true" class="p-fluid">
                    <img :src="'/demo/images/product/' + user.image" :alt="user.image" v-if="user.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field">
                        <label for="name">Nome</label>
                        <InputText id="name" v-model.trim="user.name" required="true" autofocus :invalid="submitted && !user.name" />
                        <small class="p-invalid" v-if="submitted && !user.name">Nome é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="naemailme">Email</label>
                        <InputText id="email" type="email" v-model.trim="user.email" required="true" autofocus :invalid="submitted && !user.email" />
                        <small class="p-invalid" v-if="submitted && !user.email">Email é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="password">Senha</label>
                        <Password toggleMask id="password" type="password" v-model.trim="user.password" required="true" autofocus :invalid="submitted && !user.password" />
                        <small class="p-invalid" v-if="submitted && !user.password">Senha é obrigatório.</small>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="birth_date">Nascimento</label>
                            <Calendar id="birth_date" v-model="user.birth_date" dateFormat="dd/mm/yy" :invalid="submitted && !user.birth_date" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.birth_date">Nascimento é obrigatório.</small>
                        </div>
                        <div class="field col">
                            <label for="cpf">CPF</label>
                            <InputText id="cpf" v-model="user.cpf" :invalid="submitted && !user.cpf" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.cpf">CPF é obrigatório.</small>
                        </div>
                    </div>

                    <div class="field">
                        <label for="address">Endereço</label>
                        <InputText id="address" type="address" v-model.trim="user.address" required="true" autofocus :invalid="submitted && !user.address" />
                        <small class="p-invalid" v-if="submitted && !user.address">Endereço é obrigatório.</small>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="number">Número</label>
                            <InputNumber id="number" v-model="user.number"/>
                        </div>
                        <div class="field col">
                            <label for="complement">Complemento</label>
                            <InputText id="complement" v-model="user.complement"/>
                        </div>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="zip_code">CEP</label>
                            <InputNumber id="zip_code" v-model="user.zip_code"  />
                        </div>
                        <div class="field col">
                            <label for="phone">Telefone</label>
                            <InputMask id="phone" mask="(99)99999-9999" v-model="user.phone" :invalid="submitted && !user.phone" :required="true" />
                            <small class="p-invalid" v-if="submitted && !user.phone">Telefone é obrigatório.</small>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" severity="warning" text="" @click="hideDialog" />
                        <Button label="Salvar"   icon="pi pi-check" text="" @click="saveUser" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteuserDialog" :style="{ width: '450px' }" header="Atenção!" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="user"
                            >Tem certeza que irá excluir o usuário <b>{{ user.name }}</b
                            >?</span
                        >
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
