<template>
  <q-layout>
    <q-header elevated>
      <q-toolbar class="bg-white text-primary">
        <q-toolbar-title class="row justify-center text-weight-medium">
          Energio
        </q-toolbar-title>

        <div></div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <!-- This is where pages get injected -->
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  name: 'BasicLayout',
}
</script>
