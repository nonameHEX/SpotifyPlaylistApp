<template>
  <v-container class="not-found" fluid>
    <v-row justify="center">
      <v-col id="content" cols="auto" md="6" sm="8" outlined>
        <v-row class="pt-3" justify="center">
          <v-col id="icon-col" cols="auto" md="auto" class="d-flex justify-center align-center">
            <v-icon class="search-icon">mdi-magnify</v-icon>
          </v-col>
          <v-col cols="auto">
            <h1>Stránka nenalezena</h1>
          </v-col>
        </v-row>
        <p>Stránka, kterou hledáte, neexistuje.</p>
        <v-row class="pb-6 pl-3 pr-3" justify="center">
          <router-link id="main-page" :to="{name: 'mainpage'}">
            <v-btn class="button" color="green" size="lg">
              Přejít na hlavní stránku
            </v-btn>
          </router-link>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 100px;
}

.not-found h1 {
  font-size: 24px;
}

.not-found p {
  margin-top: 16px;
}

.not-found #icon-col {
  padding-right: 0 !important;
}

.not-found button {
  margin-top: 32px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
}

.not-found #content {
  background-color: rgba(255, 215, 0, 0.25);
  border: 4px solid rgb(255, 215, 0);
  border-radius: 5px;
}</style>
