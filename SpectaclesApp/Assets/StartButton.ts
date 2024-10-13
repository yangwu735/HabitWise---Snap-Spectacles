import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { setTimeout } from "SpectaclesInteractionKit/Utils/debounce";

@component
export class NewScript extends BaseScriptComponent {
    @input myText: Text
    @input myCamera: Camera
    @input myLeftHand: SceneObject
    @input myRightHand: SceneObject 

    private updateEvent: UpdateEvent
    private pinchButton: PinchButton
    private waterTotal = 0;
    private waterTemp = 0;

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
            this.myText.text = "true"
        } else {
            this.myText.text = "false"
        }
        this.myText.text = this.myText.text + headTilt.toPrecision(2).toString(); // debug
    }
}
