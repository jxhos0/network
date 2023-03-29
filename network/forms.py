from django import forms
from .models import *

class NewPostForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].label = ""
        self.fields['content'].widget.attrs.update(placeholder="What's happening?")

    class Meta:
        model = Post
        fields = "__all__"
        widgets = {
            "content" : forms.Textarea(attrs={'rows':2}),
            "user" : forms.HiddenInput(),
        }