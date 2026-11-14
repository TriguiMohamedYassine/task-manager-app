pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_REPO = 'mohamedtrigui'
        GITOPS_REPO = 'https://github.com/TriguiMohamedYassine/task-manager-gitops.git'
        GITOPS_CREDENTIALS_ID = 'github-gitops-token'
        COMMIT_HASH = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend & Build Frontend') {
            steps {
                dir('task-manager-app/backend') {
                    // Test Spring Boot application with Maven
                    sh 'mvn clean test'
                }
                dir('task-manager-app/frontend') {
                    // Test and build Frontend
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    dir('task-manager-app/backend') {
                        sh "docker build -t ${DOCKERHUB_REPO}/task-manager-backend:${COMMIT_HASH} ."
                    }
                    dir('task-manager-app/frontend') {
                        sh "docker build -t ${DOCKERHUB_REPO}/task-manager-frontend:${COMMIT_HASH} ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKERHUB_REPO}/task-manager-backend:${COMMIT_HASH}"
                    sh "docker push ${DOCKERHUB_REPO}/task-manager-frontend:${COMMIT_HASH}"
                }
            }
        }

        stage('Update GitOps Repository') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${GITOPS_CREDENTIALS_ID}", usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh """
                        git clone https://${GIT_USER}:${GIT_TOKEN}@${GITOPS_REPO.replace('https://', '')} gitops-repo
                        cd gitops-repo/kubernetes
                        sed -i 's|image: .*/task-manager-backend:.*|image: ${DOCKERHUB_REPO}/task-manager-backend:${COMMIT_HASH}|g' backend/deployment.yaml
                        sed -i 's|image: .*/task-manager-frontend:.*|image: ${DOCKERHUB_REPO}/task-manager-frontend:${COMMIT_HASH}|g' frontend/deployment.yaml
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins@ci-cd.local"
                        git commit -am "chore(release): update image tags to commit ${COMMIT_HASH}"
                        git push origin main
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
