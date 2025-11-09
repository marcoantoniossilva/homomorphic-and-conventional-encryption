# Sistema Web de Avaliação Acadêmica com Criptografia Homomórfica

Este projeto tem como objetivo aplicar a **criptografia homomórfica** em
um sistema web de avaliação acadêmica, investigando como essa tecnologia
pode contribuir para a segurança e a privacidade dos dados. O sistema
permite que alunos respondam a pesquisas sobre disciplinas e professores
de forma confidencial, garantindo que as informações pessoais permaneçam
protegidas mesmo durante o processamento estatístico. A proposta busca
demonstrar a viabilidade prática dessa técnica em um contexto
educacional real.

A **branch atual (`main`)** não realiza a criptografia dos
dados. Ela serve como base funcional do sistema para fins de
desenvolvimento e testes iniciais, sem aplicar a camada de segurança
criptográfica. Em versões futuras, será utilizada a criptografia
homomórfica para proteger as respostas dos alunos.

## 🧩 Tecnologias Utilizadas

**Frontend:** 
- [Angular](https://angular.io/)
- [Chart.js](https://www.chartjs.org/)

**Backend:** 
- [Node.js](https://nodejs.org/) 
- [Express](https://expressjs.com/) 
- [Prisma ORM](https://www.prisma.io/)

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
- ana.oliveira@email.com --- senha `123456`
- bruno.santos@email.com --- senha `123456`
- carla.ferreira@email.com --- senha `123456`
- diego.ramos@email.com --- senha `123456`
- fernanda.lima@email.com --- senha `123456`
- rafael.costa@email.com --- senha `123456`
- juliana.pereira@email.com --- senha `123456`
- lucas.nogueira@email.com --- senha `123456`
- mariana.rocha@email.com --- senha `123456`
- felipe.andrade@email.com --- senha `123456`
- bianca.torres@email.com --- senha `123456`
- eduardo.lima@email.com --- senha `123456`
- andre.carvalho@email.com --- senha `123456`
- marina.teixeira@email.com --- senha `123456`
- gustavo.pereira@email.com --- senha `123456`

**Administrador:** 
- admin@email.com --- senha `123456`

**Professor:** 
- ricardo.menezes@email.com --- senha `123456`

**Disciplina:** 
- Banco de Dados

**Pesquisa:** 
- Nome: *Pesquisa de Banco de Dados 2025.2* 
- Data de término: *31/12/2025* 
- Questões: 
    - "O professor deixou claros os objetivos da disciplina." --- tipo *Escala Numérica* 
    - "Os conteúdos da disciplina foram apresentados de forma organizada e compreensível." --- tipo *Escala Numérica* 
    - "Houve interação adequada entre o professor e os alunos (ex: perguntas, debates, feedback)." --- tipo *Escala Numérica* 
    - "Os recursos (slides, material de apoio, laboratório, etc.) foram adequados para facilitar o aprendizado." --- tipo *Escala Numérica* 
    - "A avaliação (provas, trabalhos) refletiu bem o que foi ensinado na disciplina." --- tipo *Escala Numérica* 
    - "A carga de trabalho da disciplina (leitura, trabalhos, estudos) foi adequada às suas possibilidades." --- tipo *Escala Numérica* 
    - "A disciplina contribuiu para o seu aprendizado ou desenvolvimento acadêmico." --- tipo *Escala Numérica* 
    - "O professor demonstrou domínio do conteúdo e entusiasmo na aula." --- tipo *Escala Numérica* 
    - "Os alunos foram motivados a participar e se engajar com a disciplina." --- tipo *Escala Numérica* 
    - "De forma geral, eu recomendaria esta disciplina (e este professor) para colegas em semestres futuros." --- tipo *Sim/Não*

### 5. Rodar o backend

``` bash
cd backend
npm run dev
```

### 6. Rodar o frontend (em outro terminal)

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