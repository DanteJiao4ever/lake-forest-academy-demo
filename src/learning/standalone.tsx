import { createRoot, type Root } from "react-dom/client";
import { ReadingSample } from "./ReadingSample";

class LearningReadingSample extends HTMLElement {
  private root?: Root;
  connectedCallback() {
    this.root ??= createRoot(this);
    this.root.render(<ReadingSample />);
  }
  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }
}

if (!customElements.get("lfa-reading-sample")) {
  customElements.define("lfa-reading-sample", LearningReadingSample);
}

class InteractiveClassroom extends HTMLElement {
  private root?: Root;
  connectedCallback() {
    const element=this;
    void import("./reader/Classroom").then(({Classroom})=>{
      if(!element.isConnected || this.root)return;
      const connection=(this as InteractiveClassroom & {connection?:import("./reader/types").ReaderConnection}).connection;
      if(!connection)return;
      this.root=createRoot(this);
      this.root.render(<Classroom connection={connection}/>);
    }).catch(()=>{if(this.isConnected)this.textContent="The classroom could not load. Refresh this page to retry.";});
  }
  disconnectedCallback(){this.root?.unmount();this.root=undefined;}
}
if(!customElements.get("lfa-classroom"))customElements.define("lfa-classroom",InteractiveClassroom);

class AcademicWorkspaceElement extends HTMLElement {
  connection?: import("./AcademicWorkspace").WorkspaceConnection;
  private root?: Root;
  connectedCallback() {
    void import("./AcademicWorkspace").then(({AcademicWorkspace})=>{
      if (!this.isConnected || !this.connection || this.root) return;
      this.root=createRoot(this);
      this.root.render(<AcademicWorkspace connection={this.connection}/>);
    }).catch(()=>{if(this.isConnected)this.textContent="Unable to open this workspace. Refresh to retry.";});
  }
  disconnectedCallback(){this.root?.unmount();this.root=undefined;}
}
if (!customElements.get("lfa-academic-workspace")) customElements.define("lfa-academic-workspace",AcademicWorkspaceElement);

class PacedStudentWorkspace extends HTMLElement {
  private root?: Root;
  connectedCallback() {
    const course = this.getAttribute("course");
    const module = this.getAttribute("module");
    if (!course) return;
    void import("./pacing/PacingWorkspace").then(({PacingWorkspace}) => {
      if (!this.isConnected || this.root) return;
      this.root = createRoot(this);
      this.root.render(<PacingWorkspace course={course} moduleNumber={module === null ? null : Number(module)}/>);
    }).catch(() => {
      if (this.isConnected) this.textContent = "Course materials could not load. Refresh to retry.";
    });
  }
  disconnectedCallback() {
    queueMicrotask(() => {
      if (this.isConnected) return;
      this.root?.unmount();
      this.root = undefined;
    });
  }
}
if (!customElements.get("lfa-paced-student")) customElements.define("lfa-paced-student", PacedStudentWorkspace);
