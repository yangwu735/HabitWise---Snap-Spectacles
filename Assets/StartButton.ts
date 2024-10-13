import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Slider } from "SpectaclesInteractionKit/Components/UI/Slider/Slider";
import { setTimeout } from "SpectaclesInteractionKit/Utils/debounce";

@component
export class StartButton extends BaseScriptComponent {
    @input myText: Text
    @input myCamera: Camera
    @input myLeftHand: SceneObject
    @input myRightHand: SceneObject 
    @input waterBar: Slider
    @input title: SceneObject
    @input speaker: AudioComponent
    @input welcome: AudioTrackAsset
    @input intro: AudioTrackAsset
    @input pre1: AudioTrackAsset
    @input pre2: AudioTrackAsset
    @input pre3: AudioTrackAsset
    @input pre4: AudioTrackAsset
    @input pre5: AudioTrackAsset  //uncomment these and attach in inspector to bottom of MAIN
    @input post1: AudioTrackAsset
    @input post2: AudioTrackAsset
    @input post3: AudioTrackAsset
    @input post4: AudioTrackAsset
    @input post5: AudioTrackAsset
    @input clickedBarSound: AudioTrackAsset
    @input barText: Text

    private updateEvent: UpdateEvent
    private pinchButton: PinchButton
    private waterTotalOz = 0;
    private waterBarOz = 7; 
    // 1/8 of waterTotalOz, or 8 oz for a full bar
    //based on our research, it takes about 30 seocnds to drink 8 oz normally.
    private waterUpPerTick = 8/60 // 8/300
    private waterTickingFlag = false
    private waterDownPerTick = 8/300 //DEBUG NUMERAL
    //for viable use, set to 8 oz per
    //2 hours. This will equal 64 oz over 16 hour of awake time
    private preAudios: AudioTrackAsset[];
    private postAudios: AudioTrackAsset[];
    private clickAudios: AudioTrackAsset[];
    private drinking = false;
    private lowWarning = false;

    onAwake() {
        this.preAudios = [this.pre1, this.pre2, this.pre3, this.pre4, this.pre5];
        this.postAudios = [this.post1, this.post2, this.post3, this.post4, this.post5];
        this.clickAudios = [this.clickedBarSound]
        this.updateEvent = this.createEvent("UpdateEvent")
        this.updateEvent.enabled = false
        this.pinchButton = this.sceneObject.getComponent(PinchButton.getTypeName())
        this.updateEvent.bind(() => {
            this.checkX();
            this.moveTitle();
        });

        
        setTimeout(() => {
            this.updateEvent.enabled = true
        }, 3000)

        setTimeout(() => {
            this.speaker.audioTrack = this.welcome
            this.speaker.play(1)
            this.sayIntro()
        }, 3500)
        this.pinchButton.onButtonPinched.add(() => {
            
        });

        
    }

    moveTitle() {
        if (this.title.getTransform().getWorldPosition().z < 20) {
            var newVec = new vec3(this.title.getTransform().getWorldPosition().sub(this.myCamera.getTransform().getWorldPosition()).x * 0.02,
                                  this.title.getTransform().getWorldPosition().sub(this.myCamera.getTransform().getWorldPosition()).y * 0.02,
                                  this.title.getTransform().getWorldPosition().sub(this.myCamera.getTransform().getWorldPosition()).z * 0.02)
            this.title.getTransform().setWorldPosition(this.title.getTransform().getWorldPosition().sub(newVec))
        }
    }

    sayIntro() {
        setTimeout(() => {
            this.speaker.audioTrack = this.intro
            this.speaker.play(1)
        }, 2500)
    }

    randomSpeak(audios: AudioTrackAsset[]) {
        setTimeout(() => {
            this.speaker.audioTrack = audios[Math.floor(Math.random() * audios.length)]
            this.speaker.play(1)
        }, 100)
        
    }

    checkX() {
        var headTilt = this.myCamera.getTransform().getWorldRotation().toEulerAngles().x % Math.PI
        var leftHandtoHead = this.myLeftHand.getTransform().getWorldPosition().sub(this.myCamera.getTransform().getWorldPosition()).length
        var rightHandtoHead = this.myRightHand.getTransform().getWorldPosition().sub(this.myCamera.getTransform().getWorldPosition()).length
        if ((leftHandtoHead < 21 || rightHandtoHead < 21) && (headTilt > 0 && headTilt < 2.2)){ 
            if (!this.waterTickingFlag) {
                this.waterTickingFlag = true
                
                setTimeout(() => {
                    this.waterBarOz = Math.min(8, this.waterBarOz + this.waterUpPerTick)
                    this.waterTotalOz = this.waterTotalOz + this.waterUpPerTick
                    this.waterTickingFlag = false
                }, 100)
                this.waterBar.currentValue = this.waterBarOz / 8.0
                if (!this.drinking) {
                    this.randomSpeak(this.postAudios)
                    this.drinking = true
                }
            }
        } else {
            if (!this.waterTickingFlag) {
                this.waterTickingFlag = true
                this.drinking = false
                setTimeout(() => {
                    this.waterBarOz = Math.max(0, this.waterBarOz - this.waterDownPerTick)
                    this.waterTickingFlag = false
                }, 100)
                this.waterBar.currentValue = this.waterBarOz / 8.0

                if(this.waterBar.currentValue <= 0.2 && !this.lowWarning) {
                    this.randomSpeak(this.preAudios)
                    this.lowWarning = true
                } else if (this.waterBar.currentValue > 0.2) {
                    this.lowWarning = false
                }

                //if(this.waterBar.onHoverEnter)
                
            }
        }
        this.barText.text = this.waterTotalOz.toFixed(0).toString() + " oz"
        this.myText.text = this.waterBar.currentValue.toFixed(2).toString() // debug
    }
}
