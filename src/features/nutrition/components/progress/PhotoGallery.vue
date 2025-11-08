<template>
  <div class="photo-gallery">
    <div class="gallery-header">
      <h3 class="gallery-title">Progress Photos</h3>
      <ion-button fill="clear" size="small" @click="showAddPhoto = true">
        <ion-icon :icon="add" slot="icon-only" />
      </ion-button>
    </div>
    <div v-if="photos.length === 0" class="empty-state">
      <ion-icon :icon="camera" class="empty-icon" />
      <p>No photos yet</p>
      <ion-button fill="outline" @click="showAddPhoto = true">
        Add Photo
      </ion-button>
    </div>
    <div v-else class="photos-grid">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
        @click="viewPhoto(photo)"
      >
        <img :src="photo.url" :alt="photo.date" />
        <div class="photo-overlay">
          <div class="photo-date">{{ formatDate(photo.date) }}</div>
        </div>
      </div>
    </div>

    <!-- Photo Viewer Modal -->
    <ion-modal :is-open="showViewer" @didDismiss="showViewer = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedPhoto?.date }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showViewer = false">
              <ion-icon :icon="close" slot="icon-only" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="photo-viewer">
          <img v-if="selectedPhoto" :src="selectedPhoto.url" :alt="selectedPhoto.date" />
        </div>
      </ion-content>
    </ion-modal>

    <!-- Add Photo Modal (placeholder) -->
    <ion-modal :is-open="showAddPhoto" @didDismiss="showAddPhoto = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add Progress Photo</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddPhoto = false">
              <ion-icon :icon="close" slot="icon-only" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="add-photo">
          <p>Photo capture functionality coming soon</p>
          <p class="hint">This will integrate with Capacitor Camera plugin</p>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from "@ionic/vue";
import { add, camera, close } from "ionicons/icons";
import { BodyMetricsRepository } from "@/features/nutrition/repositories/body-metrics.repository";

interface Photo {
  url: string;
  date: string;
}

const photos = ref<Photo[]>([]);
const showViewer = ref(false);
const showAddPhoto = ref(false);
const selectedPhoto = ref<Photo | null>(null);

onMounted(async () => {
  await loadPhotos();
});

async function loadPhotos() {
  try {
    const metrics = await BodyMetricsRepository.getByUserId();
    const photoList: Photo[] = [];
    
    for (const metric of metrics) {
      if (metric.photoPaths) {
        try {
          const paths = JSON.parse(metric.photoPaths) as string[];
          paths.forEach((path) => {
            photoList.push({
              url: path, // In production, this would be a proper file URL
              date: metric.date,
            });
          });
        } catch {
          // Invalid JSON, skip
        }
      }
    }
    
    photos.value = photoList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Failed to load photos:", error);
  }
}

function viewPhoto(photo: Photo) {
  selectedPhoto.value = photo;
  showViewer.value = true;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
</script>

<style scoped>
.photo-gallery {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
  margin-bottom: var(--spacing-xl);
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);
}

.gallery-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--spacing-base);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: var(--spacing-sm);
}

.photo-date {
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.photo-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-xl);
}

.photo-viewer img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.add-photo {
  padding: var(--spacing-2xl);
  text-align: center;
}

.add-photo p {
  color: var(--color-text-secondary);
  margin: var(--spacing-base) 0;
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}
</style>

