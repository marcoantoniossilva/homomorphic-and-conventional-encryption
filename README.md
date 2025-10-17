# Sistema Web de Avaliação Acadêmica com Criptografia Homomórfica

Este projeto tem como objetivo aplicar a **criptografia homomórfica** em
um sistema web de avaliação acadêmica, investigando como essa tecnologia
pode contribuir para a segurança e a privacidade dos dados. O sistema
permite que alunos respondam a pesquisas sobre disciplinas e professores
de forma confidencial, garantindo que as informações pessoais permaneçam
protegidas mesmo durante o processamento estatístico. A proposta busca
demonstrar a viabilidade prática dessa técnica em um contexto
educacional real.

A **branch atual (`homomorphic-encryption`)** implementa a criptografia 
dos valores das respostas utilizando criptografia homomórfica por meio da 
biblioteca paillier-bigint.

## 🧩 Tecnologias Utilizadas

**Frontend:** 
- [Angular](https://angular.io/)
- [Chart.js](https://www.chartjs.org/)
- [paillier-bigint](https://www.npmjs.com/package/paillier-bigint/)

**Backend:** 
- [Node.js](https://nodejs.org/) 
- [Express](https://expressjs.com/) 
- [Prisma ORM](https://www.prisma.io/)
- [paillier-bigint](https://www.npmjs.com/package/paillier-bigint/)

**Banco de Dados:** 
- [PostgreSQL](https://www.postgresql.org/) em container [Docker](https://www.docker.com/)

------------------------------------------------------------------------

## ⚙️ Instruções para execução do projeto

### 1. Instalar dependências do backend e frontend

``` bash
cd backend
npm i
```

``` bash
cd frontend
npm i
```

### 2. Subir o container do banco de dados

``` bash
cd backend
docker-compose up -d
```

### 3. Gerar e aplicar as migrations do Prisma

``` bash
cd backend
npx prisma migrate reset #se necessário
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Popular o banco com dados de exemplo

``` bash
cd backend
npm run seed
```

O script criará os seguintes registros:

**Alunos:** 
- aluno1@gmail.com --- senha `123456` 
- aluno2@gmail.com --- senha `123456` 
- aluno3@gmail.com --- senha `123456`

**Administrador:** 
- admin@email.com --- senha `123456`

**Professor:** 
- professor@email.com --- senha `123456`

**Disciplina:** 
- Banco de Dados

**Pesquisa:** 
- Nome: *Pesquisa de Banco de Dados* 
- Data de término: *31/12/2025* 
- Questões: 
    - "O professor demonstrou compreensão da disciplina" --- tipo *Escala Numérica* 
    - "A disciplina é interessante?" --- tipo *Sim/Não*

### 5. Gerar par de chaves e atualizar a chave do frontend

Gere as chaves
``` bash
cd backend
npm run generate-keys
```
Após gerar, atualizar o arquivo /frontend/privateKey.ts com os dados da chave privada, 
que estará em /backend/privateKey.json, depois, a chave privada pode ser excluída do
backend.

### 6. Rodar o backend

``` bash
cd backend
npm run dev
```

### 7. Rodar o frontend (em outro terminal)

``` bash
cd frontend
ng serve
```

------------------------------------------------------------------------

## 📚 Sobre o Projeto

Este trabalho faz parte de um estudo acadêmico sobre **criptografia
homomórfica aplicada à segurança da informação**, explorando seu uso
prático em sistemas web reais. A proposta busca unir conhecimento
teórico e aplicação prática para fortalecer a privacidade em ambientes
de avaliação digital.

## 👨‍💻 Autor

**Marco Antonio S. Silva**  
[LinkedIn](https://www.linkedin.com/in/marcosilva95) • [GitHub](https://github.com/marcoantoniossilva) • [YouTube](https://www.youtube.com/@MarcoAntonioSSilvaDev)