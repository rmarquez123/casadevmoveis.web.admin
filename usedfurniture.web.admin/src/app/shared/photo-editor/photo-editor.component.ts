import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ImageCropperComponent,
    ImageCroppedEvent,
    ImageTransform,
} from 'ngx-image-cropper';

@Component({
    selector: 'app-photo-editor',
    standalone: true,
    imports: [CommonModule, ImageCropperComponent],
    templateUrl: './photo-editor.component.html',
    styleUrls: ['./photo-editor.component.css'],
})
export class PhotoEditorComponent {
    @Input({ required: true }) imageBase64!: string;

    @Output() cancel = new EventEmitter<void>();
    @Output() save = new EventEmitter<string>();

    /* Cropper state */
    editedBase64: string | null = null;

    /* Rotation in degrees (rotates image within the canvas) */
    rotationDeg = 0;

    transform: ImageTransform = {
        rotate: 0,
        scale: 1,
        flipH: false,
        flipV: false,
    };

    onImageCropped(e: ImageCroppedEvent) {
        /* Prefer blob output (what you're getting), and convert to base64 DataURL */
        if (e.blob) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string; // "data:image/jpeg;base64,...."
                this.editedBase64 = dataUrl;
            };
            reader.readAsDataURL(e.blob);
            return;
        }

        /* Fallbacks in case your config later changes */
        this.editedBase64 = e.base64 ?? null;
    }
    private stripDataUrlPrefix(value: string): string {
        const comma = value.indexOf(',');
        return comma >= 0 ? value.slice(comma + 1) : value;
    }

    get normalizedBase64(): string {
        return this.stripDataUrlPrefix(this.imageBase64);
    }

    rotateLeft(step = 1) {
        this.rotationDeg -= step;
        this.transform = {
            ...this.transform,
            rotate: this.rotationDeg,
        };
    }

    rotateRight(step = 1) {
        this.rotationDeg += step;
        this.transform = {
            ...this.transform,
            rotate: this.rotationDeg,
        };
    }


    zoom(delta: number) {
        const next = Math.max(0.2, Math.min(4, (this.transform.scale ?? 1) + delta));
        this.transform = { ...this.transform, scale: next };
    }

    flipH() {
        this.transform = { ...this.transform, flipH: !this.transform.flipH };
    }

    flipV() {
        this.transform = { ...this.transform, flipV: !this.transform.flipV };
    }
    onRotateSlider(event: Event) {
        const value = Number((event.target as HTMLInputElement).value);
        this.rotationDeg = value;
        this.transform = {
            ...this.transform,
            rotate: value,
        };
    }

    reset() {
        this.rotationDeg = 0;
        this.transform = {
            rotate: 0,
            scale: 1,
            flipH: false,
            flipV: false,
        };
        this.editedBase64 = null;
    }

    onCancel() {
        console.log('Cancelling photo edit');
        this.cancel.emit();
    }

    onSave() {
        console.log('Saving edited photo');
        if (!this.editedBase64) return;
        this.save.emit(this.editedBase64);
    }
}
