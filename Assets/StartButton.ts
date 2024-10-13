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

    private updateEvent: UpdateEvent
    private pinchButton: PinchButton
    private waterTotalOz = 0;
    private waterBarOz = 4; 
    // 1/8 of waterTotalOz, or 8 oz for a full bar
    //based on our research, it takes about 30 seocnds to drink 8 oz normally.
    private waterUpPerTick = 8/60 // 8/300
    private waterTickingFlag = false
    private waterDownPerTick = 8/300 //DEBUG NUMERAL
    //for viable use, set to 8 oz per
    //2 hours. This will equal 64 oz over 16 hour of awake time

    onAwake() {
        this.updateEvent = this.createEvent("UpdateEvent")
        this.updateEvent.enabled = false
        this.pinchButton = this.sceneObject.getComponent(PinchButton.getTypeName())
        this.updateEvent.bind(() => {
            this.checkX();
        });
        this.pinchButton.onButtonPinched.add(() => {
            this.updateEvent.enabled = true
        });
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
            }
        } else {
            if (!this.waterTickingFlag) {
                this.waterTickingFlag = true
                setTimeout(() => {
                    this.waterBarOz = Math.max(0, this.waterBarOz - this.waterDownPerTick)
                    this.waterTickingFlag = false
                }, 100)
                this.waterBar.currentValue = this.waterBarOz / 8.0
            }
        }
        this.myText.text = this.waterBar.currentValue.toPrecision(2).toString() // debug
    }
}
