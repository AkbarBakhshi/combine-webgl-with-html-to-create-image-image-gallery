import * as THREE from 'three'
import gsap from 'gsap';

import vertex from 'shaders/vertex.glsl'
import fragment from 'shaders/fragment.glsl'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default class {
    constructor() {

        this.scroll = 0

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 10, 1000)
        this.camera.fov = 2 * Math.atan((this.height / 2) / 10) * (180 / Math.PI)
        this.camera.position.set(0, 0, 10)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.threejsCanvas.appendChild(this.renderer.domElement)

        this.addTextureImages()

        let st = ScrollTrigger.create({
            trigger: ".threejs",
            start: "top top",
            markers: true,
            end: "bottom bottom"
        });

        document.addEventListener('scroll', () => {
            this.scroll = st.scroll()
        })

        this.onResize()

    }

    addTextureImages() {
        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100)

        this.images = [...document.querySelectorAll('.threejs .image')]

        // console.log(this.images)

        this.imageData = this.images.map((image) => {
            // console.log(image)
            let boundaries = image.getBoundingClientRect()

            // console.log(boundaries)

            const texture = new THREE.TextureLoader().load(image.getAttribute('src'));

            const material = new THREE.ShaderMaterial({
                vertexShader: vertex,
                fragmentShader: fragment,
                uniforms:
                {
                    uHoverState: { value: 0 },
                    uTexture: { value: texture }
                }
            })
            // const material = new THREE.MeshBasicMaterial({
            //     map: texture,
            //     side: THREE.DoubleSide,
            // })

            const imageMesh = new THREE.Mesh(this.geometry, material)

            imageMesh.scale.set(boundaries.width, boundaries.height)

            this.scene.add(imageMesh)

            image.addEventListener('mouseenter', () => {
                gsap.to(material.uniforms.uHoverState, {
                    duration: 1,
                    value: 1,
                    ease: "power3.out"
                })
            })
            image.addEventListener('mouseout', () => {
                gsap.to(material.uniforms.uHoverState, {
                    duration: 1,
                    value: 0,
                    ease: "power3.out"
                })
            })

            return {
                image,
                imageMesh,
                width: boundaries.width,
                height: boundaries.height,
                top: boundaries.top,
                left: boundaries.left,
            }

        })

    }

    updatePosition() {
        this.imageData.forEach((image) => {
            image.imageMesh.position.x = image.left - this.width / 2 + image.width / 2
            image.imageMesh.position.y = this.scroll - image.top + this.height / 2 - image.height / 2
        })
    }

    onMouseDown() {

    }

    onMouseUp() {

    }

    onMouseMove() {

    }

    update() {
        this.renderer.render(this.scene, this.camera)
        this.updatePosition()
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        if (this.imageData) {
            for (let i = 0; i < this.imageData.length; i++) {
                this.imageData[i].top = this.images[i].getBoundingClientRect().top
                this.imageData[i].height = this.images[i].getBoundingClientRect().height
                this.imageData[i].left = this.images[i].getBoundingClientRect().left
                this.imageData[i].width = this.images[i].getBoundingClientRect().width
                this.imageData[i].imageMesh.scale.set(this.images[i].getBoundingClientRect().width, this.images[i].getBoundingClientRect().height)
            }
        }
    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}