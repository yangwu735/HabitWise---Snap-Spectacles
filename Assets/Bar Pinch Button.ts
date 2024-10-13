import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

@component
export class NewScript extends BaseScriptComponent {
    @input text: Text
    private pinchButton: PinchButton
    
    onAwake() {
        this.pinchButton = this.sceneObject.getComponent(PinchButton.getTypeName())
        this.pinchButton.onButtonPinched.add(() => {
            if (this.text.size == 0) {
                this.text.size = 48
            } else {
                this.text.size = 0
            }
        });
    }
}
